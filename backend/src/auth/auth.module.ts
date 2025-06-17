import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'MY_STRONGER_SECRET_KEY_FOR_RSUD_ANUGERAH_APP',
      signOptions: { expiresIn: '7d' }, // Increase token expiration to 7 days
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], // Export JwtModule so it can be used in other modules
})
export class AuthModule {}
