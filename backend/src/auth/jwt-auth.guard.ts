import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
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

      // Add user info to request object with proper format
      request.user = {
        userId: decoded.sub,  // Use userId instead of id for consistency
        id: decoded.sub,      // Keep id for backward compatibility
        role: decoded.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
