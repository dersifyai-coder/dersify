import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
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

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Register a new user" })
  @Post("register")
  register(@Body() dto: RegisterDto): Promise<ApiResponse<AuthResult>> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: "Login with email and password" })
  @Post("login")
  login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResult>> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @Post("refresh")
  refresh(@Body() dto: RefreshDto): Promise<ApiResponse<RefreshResult>> {
    return this.authService.refresh(dto);
  }

  @ApiOperation({ summary: "Get current authenticated user profile" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: SupabaseJwtPayload): ApiResponse<SupabaseJwtPayload> {
    return this.authService.currentUser(user);
  }
}
