import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class CognitoService {
  private cognito: AWS.CognitoIdentityServiceProvider;
  private userPoolId = process.env.COGNITO_POOL_ID; // Replace with your User Pool ID
  private clientId = process.env.COGNITO_CLIENT_ID; // Replace with your App Client ID
  private clientSecret = process.env.COGNITO_CLIENT_SECRET;

  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      region: 'us-east-1', // Replace with the correct AWS region
    });
  }

  // Helper function to compute SECRET_HASH
  private computeSecretHash(username: string): string {
    const hmac = crypto.createHmac(
      'sha256',
      process.env.COGNITO_CLIENT_SECRET || '',
    );
    hmac.update(username + this.clientId);
    return hmac.digest('base64');
  }

  async signUp(username: string, password: string, role: string) {
    // if (!this.clientId || !this.clientSecret) {
    //   throw new Error('Cognito Client ID or Secret is not defined');
    // }
    const params = {
      ClientId: this.clientId || '',
      SecretHash: this.computeSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email', // Use 'email' instead of 'Username'
          Value: username, // Assuming username is an email
        },
      ],
    };

    try {
      const result = await this.cognito.signUp(params).promise();
      return result;
    } catch (error) {
      throw new Error(`Error during sign-up: ${error.message}`);
    }
  }

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
      const result = await this.cognito.confirmSignUp(params).promise();
      return result; // This indicates that the user is confirmed
    } catch (error) {
      throw new Error(`Error during confirmation: ${error.message}`);
    }
  }

  async resendSignUpCode({ username }: { username: string }) {
    try {
      const params = {
        ClientId: this.clientId || '',
        Username: username,
        SecretHash: this.computeSecretHash(username),
      };
      await this.cognito.resendConfirmationCode(params).promise();
    } catch (error) {
      console.log('error resending registration code', error);
    }
  }

  async signIn(username: string, password: string) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId || '',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: this.computeSecretHash(username), // Include SecretHash here
      },
    };

    try {
      const result = await this.cognito.initiateAuth(params).promise();
      return result.AuthenticationResult; // Contains the JWT tokens (ID, Access, and Refresh)
    } catch (error) {
      throw new UnauthorizedException(
        `Authentication failed: ${error.message}`,
      );
    }
  }
}
