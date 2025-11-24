import { Body, Controller, Post, Get, Patch, UsePipes, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("signup")
  @UsePipes(new ZodValidationPipe(SignupDto))
  signup(@Body() body: any) {
    return this.auth.signup(body);
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(LoginDto))
  login(@Body() body: any) {
    return this.auth.login(body);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout() {
    // JWT is stateless, so logout is mainly client-side
    // In future, could implement token blacklisting here
    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() u: any) {
    return this.auth.getProfile(u.userId);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() u: any, @Body() body: { name?: string; email?: string }) {
    return this.auth.updateProfile(u.userId, body);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() u: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.auth.changePassword(u.userId, body.currentPassword, body.newPassword);
  }
}

