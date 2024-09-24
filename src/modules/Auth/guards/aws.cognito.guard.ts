import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly verifier;
  constructor() {
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_POOL_ID || '', // Your User Pool ID
      tokenUse: 'access', // or 'id' based on your use case
      clientId: process.env.COGNITO_CLIENT_ID, // Your Client ID
      issuer: process.env.COGNITO_ISSUER_URL, // Expected issuer
      // Add additional options if needed
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new ForbiddenException('Token not provided');
    }

    try {
      const payload = await this.verifier.verify(token, {
        tokenUse: 'access',
        clientId: process.env.COGNITO_CLIENT_ID || '',
      });
      // You can add additional checks or modify the request object if needed
      request.user = payload; // Attach the payload to the request object
      return true;
    } catch (error) {
      throw new ForbiddenException(`Token not valid: ${error.message}`);
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [, token] = authHeader.split(' ');
    return token || null;
  }
}
