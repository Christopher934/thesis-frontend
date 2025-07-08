import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesGuard } from './roles.guard';

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
  providers: [AuthService, RolesGuard],
  exports: [JwtModule, RolesGuard], // Export JwtModule and RolesGuard so they can be used in other modules
})
export class AuthModule {}
