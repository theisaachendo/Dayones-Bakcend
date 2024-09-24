import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserService } from 'src/modules/user/services/user.service';
import { ROLES } from 'src/shared/constants';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class CognitoService {
  private clientId = process.env.COGNITO_CLIENT_ID; // Replace with your App Client ID
  private cognitoClient;

  constructor(private userService: UserService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
  }

  // Helper function to compute SECRET_HASH
  /**
   *
   * @param username Service to compute hash on the basis of cognito client secret
   * @returns {String}
   */
  private computeSecretHash(username: string): string {
    const hmac = crypto.createHmac(
      'sha256',
      process.env.COGNITO_CLIENT_SECRET || '',
    );
    hmac.update(username + this.clientId);
    return hmac.digest('base64');
  }

  /**
   * Service for user signup on the basis of user data
   * @param email
   * @param password
   * @param role
   * @param name
   * @param phoneNumber
   * @returns {}
   */
  async signUp(
    email: string,
    password: string,
    role: string,
    name: string,
    phoneNumber: string,
  ) {
    const params = {
      ClientId: this.clientId || '',
      SecretHash: this.computeSecretHash(email),
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email', // Standard Cognito attribute for email
          Value: email, // Assuming username is an email
        },
        {
          Name: 'custom:role', // Custom attribute for role
          Value: role,
        },
        {
          Name: 'name',
          Value: name,
        },
        {
          Name: 'phone_number',
          Value: phoneNumber,
        },
      ],
    };

    try {
      const command = new SignUpCommand(params);
      const result = await this.cognitoClient.send(command);
      await this.userService.createUser({
        fullName: name,
        email,
        phone_number: phoneNumber, // Ensure you pass phoneNumber as phone_number
        role: ROLES[role as keyof typeof ROLES], // Assuming role is of type ROLES
        user_sub: result.UserSub || '', // UserSub returned by Cognito
        is_confirmed: false, // Assuming the user is not confirmed immediately
      });
      return result;
    } catch (error) {
      console.error('🚀 ~ CognitoService ~ error:', error);
      throw new HttpException(
        `User Creation Error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * This service will confirm the user signup after verifying the code
   * @param username
   * @param confirmationCode
   * @returns {}
   */
  async confirmSignUp(
    username: string,
    confirmationCode: string,
  ): Promise<any> {
    const params = {
      ClientId: this.clientId || '',
      Username: username,
      SecretHash: this.computeSecretHash(username),
      ConfirmationCode: confirmationCode,
    };

    try {
      const command = new ConfirmSignUpCommand(params);
      const result = await this.cognitoClient.send(command);
      return result;
    } catch (error) {
      console.error('🚀 ~ CognitoService ~ error:', error);
      throw new HttpException(
        `Code Verification failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * This service will send the signup verify code again
   * @param username
   * @returns {}
   */
  async resendSignUpCode(username: string) {
    try {
      const params = {
        ClientId: this.clientId || '',
        Username: username,
        SecretHash: this.computeSecretHash(username),
      };
      const command = new ResendConfirmationCodeCommand(params);
      const response = await this.cognitoClient.send(command);
      return response;
    } catch (error) {
      console.error('error resending registration code', error);
      throw new HttpException(
        `Verification Code Sending failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * This service will authenticate the user credentials using aws cognito
   * @param username
   * @param password
   * @returns {AccessToken}
   */
  async signIn(username: string, password: string) {
    const params = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: this.clientId || '',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: this.computeSecretHash(username), // Include SecretHash here
      },
    };

    try {
      const command = new InitiateAuthCommand(params);
      const response = await this.cognitoClient.send(command);
      const cognito = CognitoJwtVerifier.create({
        userPoolId: process.env.COGNITO_POOL_ID || '', // Your User Pool ID
        tokenUse: 'access', // or 'id' based on your use case
        clientId: process.env.COGNITO_CLIENT_ID, // Your Client ID
        issuer: process.env.COGNITO_ISSUER_URL, // Expected issuer
        // Add additional options if needed
      });
      const payload = await cognito.verify(
        response?.AuthenticationResult?.AccessToken || '',
        {
          tokenUse: 'access',
          clientId: process.env.COGNITO_CLIENT_ID || '',
        },
      );
      await this.userService.updateIsConfirmedUser({
        user_sub: payload.username,
        is_confirmed: true,
      });
      const user = await this.userService.findUserByUserSub(payload.username);
      return { response: response.AuthenticationResult, user }; // Contains the JWT tokens (ID, Access, and Refresh)
    } catch (error) {
      throw new UnauthorizedException(
        `Authentication failed: ${error.message}`,
      );
    }
  }

  /**
   * Service to signout the aes cognito user
   * @param accessToken
   * @returns {}
   */
  async signOut(accessToken: string) {
    const params = {
      AccessToken: accessToken,
    };
    try {
      // Global sign out logs the user out from all devices
      const command = new GlobalSignOutCommand(params);
      const result = await this.cognitoClient.send(command);
      return result; // Successfully signed out
    } catch (error) {
      console.error('🚀 ~ CognitoService ~ signOut error:', error);
      throw new UnauthorizedException(`Sign out failed: ${error.message}`);
    }
  }

  async getUser(accessToken: string) {
    try {
      const params = {
        AccessToken: accessToken,
      };
      // Global sign out logs the user out from all devices
      const command = new GetUserCommand(params);
      const result = await this.cognitoClient.send(command);
      return result; // Successfully signed out
    } catch (error) {
      console.error('🚀 ~ CognitoService ~ signOut error:', error);
      throw new UnauthorizedException(`Get User failed: ${error.message}`);
    }
  }
}
