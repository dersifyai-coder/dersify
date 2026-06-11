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

export interface AuthResult {
  user: User;
  session: Session | null;
}

export interface RefreshResult {
  session: Session;
}

@Injectable()
export class AuthService {
  private readonly supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>;

  constructor(configService: ConfigService<AppConfig, true>) {
    const supabaseUrl = configService.get("supabase.url", { infer: true });
    const serviceKey = configService.get("supabase.serviceKey", { infer: true });

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is required.");
    }

    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_KEY is required.");
    }

    this.supabaseAdmin = createSupabaseAdminClient(supabaseUrl, serviceKey);
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
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException("Registration did not return a user.");
    }

    const { error: profileError } = await this.supabaseAdmin.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
    });

    if (profileError) {
      throw new InternalServerErrorException("User was created, but profile creation failed.");
    }

    return this.ok("Registration successful.", {
      user: data.user,
      session: data.session,
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

    return this.ok("Login successful.", {
      user: data.user,
      session: data.session,
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
