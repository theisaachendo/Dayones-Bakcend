import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CognitoService } from '../services/cognito.service';
import { JwtGuard } from 'src/modules/Auth/guards/aws.cognito.guard';

@ApiTags('auth')
@Controller('auth')
export class CognitoController {
  constructor(private cognitoService: CognitoService) {}

  @Post('signup')
  async userSignUp(
    @Body()
    body: {
      email: string;
      password: string;
      role: string;
      name: string;
      phone_number: string;
    },
  ): Promise<any> {
    try {
      return await this.cognitoService.signUp(
        body.email,
        body.password,
        body.role,
        body.name,
        body.phone_number,
      );
    } catch (error) {
      console.error('🚀 ~ CognitoController ~ userSignUp ~ error:', error);
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
      console.error('🚀 ~ CognitoController ~ verifyUser ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }

  @Post('resendConfirm')
  async resendConfirmationCode(
    @Body() body: { username: string },
  ): Promise<any> {
    const { username } = body;
    try {
      const result = await this.cognitoService.resendSignUpCode(username);
      return result; // Indicate success
    } catch (error) {
      console.error(
        '🚀 ~ CognitoController ~ resendConfirmationCode ~ error:',
        error,
      );
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
      console.error('🚀 ~ CognitoController ~ signIn ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }

  @Post('signout')
  async signout(@Body() body: { accessToken: string }): Promise<any> {
    const { accessToken } = body;
    try {
      const result = await this.cognitoService.signOut(accessToken);
      return result; // Return the sign-in result (e.g., tokens)
    } catch (error) {
      console.error('🚀 ~ CognitoController ~ signout ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }

  @UseGuards(JwtGuard)
  @Post('getUser')
  async getCognitoUser(@Body() body: { accessToken: string }): Promise<any> {
    const { accessToken } = body;
    try {
      const result = await this.cognitoService.getUser(accessToken);
      return result; // Return the sign-in result (e.g., tokens)
    } catch (error) {
      console.error('🚀 ~ CognitoController ~ getCognitoUser ~ error:', error);
      throw error; // Handle the error appropriately
    }
  }
}
