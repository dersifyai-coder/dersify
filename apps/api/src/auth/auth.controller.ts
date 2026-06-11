import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  ApiResponse,
  AuthResult,
  AuthService,
  RefreshResult,
} from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { SupabaseJwtPayload } from "./strategies/jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<ApiResponse<AuthResult>> {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResult>> {
    return this.authService.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshDto): Promise<ApiResponse<RefreshResult>> {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: SupabaseJwtPayload): ApiResponse<SupabaseJwtPayload> {
    return this.authService.currentUser(user);
  }
}
