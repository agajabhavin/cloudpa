import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const org = await this.prisma.org.create({
      data: { name: dto.orgName },
    });
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hash, name: dto.name },
    });
    await this.prisma.orgUser.create({
      data: { orgId: org.id, userId: user.id, role: "OWNER" },
    });
    return this.makeToken(user.id, org.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    const orgUser = await this.prisma.orgUser.findFirst({
      where: { userId: user.id },
    });
    if (!orgUser) throw new UnauthorizedException("No org");
    return this.makeToken(user.id, orgUser.orgId);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException("User not found");
    
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new UnauthorizedException("Current password is incorrect");
    
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    
    return { message: "Password updated successfully" };
  }

  private makeToken(userId: string, orgId: string) {
    const access_token = this.jwt.sign({ sub: userId, orgId });
    return { access_token, userId, orgId };
  }
}

