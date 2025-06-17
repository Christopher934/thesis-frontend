import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify and decode token
      const decoded = this.jwtService.verify(token);

      // Add user info to request object
      request.user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
