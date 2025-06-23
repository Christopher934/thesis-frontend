// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() loginDto: LoginDto) {
    // loginDto memiliki { email: string; password: string }
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
