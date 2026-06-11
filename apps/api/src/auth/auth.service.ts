import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Session, User } from "@supabase/supabase-js";
import { AppConfig } from "../config/configuration";
import { createSupabaseAdminClient } from "../lib/supabase";
import { SupabaseJwtPayload } from "./strategies/jwt.strategy";
import { PrismaService } from "../prisma/prisma.service";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface ProfileSummary {
  onboarding_completed: boolean;
  subscription_tier: string;
}

export interface AuthResult {
  user: User;
  session: Session | null;
  profile: ProfileSummary;
}

export interface RefreshResult {
  session: Session;
}

@Injectable()
export class AuthService {
  private readonly supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>;
  private readonly appUrl: string;

  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get("supabase.url", { infer: true });
    const serviceKey = configService.get("supabase.serviceKey", { infer: true });

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is required.");
    }

    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_KEY is required.");
    }

    this.supabaseAdmin = createSupabaseAdminClient(supabaseUrl, serviceKey);
    this.appUrl = configService.get("appUrl", { infer: true });
  }

  async register(input: RegisterInput): Promise<ApiResponse<AuthResult>> {
    const email = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();

    if (!fullName) {
      throw new BadRequestException("Full name is required.");
    }

    const { data, error } = await this.supabaseAdmin.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${this.appUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException("Registration did not return a user.");
    }

    try {
      await this.prisma.profile.create({
        data: {
          id: data.user.id,
          fullName: fullName,
        },
      });
    } catch (profileError) {
      await this.supabaseAdmin.auth.admin.deleteUser(data.user.id);
      throw new InternalServerErrorException("User was created, but profile creation failed.");
    }

    return this.ok("Registration successful.", {
      user: data.user,
      session: data.session,
      profile: {
        onboarding_completed: false,
        subscription_tier: "free",
      },
    });
  }

  async login(input: LoginInput): Promise<ApiResponse<AuthResult>> {
    const email = input.email.trim().toLowerCase();

    const { data, error } = await this.supabaseAdmin.auth.signInWithPassword({
      email,
      password: input.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException("Invalid login credentials.");
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: data.user.id },
      select: { onboardingCompleted: true, subscriptionTier: true },
    });

    return this.ok("Login successful.", {
      user: data.user,
      session: data.session,
      profile: {
        onboarding_completed: profile?.onboardingCompleted ?? false,
        subscription_tier: profile?.subscriptionTier ?? "free",
      },
    });
  }

  async refresh(input: RefreshInput): Promise<ApiResponse<RefreshResult>> {
    const { data, error } = await this.supabaseAdmin.auth.refreshSession({
      refresh_token: input.refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    return this.ok("Session refreshed.", {
      session: data.session,
    });
  }

  currentUser(user: SupabaseJwtPayload): ApiResponse<SupabaseJwtPayload> {
    return this.ok("Current user loaded.", user);
  }

  private ok<T>(message: string, data: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }
}
