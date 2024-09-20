import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CognitoService } from '../services/cognito.service';

@ApiTags('auth')
@Controller('auth')
export class CognitoController {
  constructor(private cognitoService: CognitoService) {}

  @Post('signup')
  async userSignUp(
    @Body() body: { username: string; password: string; role: string },
  ): Promise<any> {
    try {
      return await this.cognitoService.signUp(
        body.username,
        body.password,
        body.role,
      );
    } catch (error) {
      console.log('🚀 ~ CognitoController ~ userSignUp ~ error:', error);
      throw error;
    }
  }

  @Post('verify')
  async verifyUser(
    @Body() body: { username: string; confirmationCode: string },
  ): Promise<any> {
    const { username, confirmationCode } = body;
    try {
      const result = await this.cognitoService.confirmSignUp(
        username,
        confirmationCode,
      );
      return result; // Indicate success
    } catch (error) {
      console.log('🚀 ~ CognitoController ~ verifyUser ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }

  @Post('signin')
  async signIn(
    @Body() body: { username: string; password: string },
  ): Promise<any> {
    const { username, password } = body;
    try {
      const result = await this.cognitoService.signIn(username, password);
      return result; // Return the sign-in result (e.g., tokens)
    } catch (error) {
      console.log('🚀 ~ CognitoController ~ signIn ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }
}
