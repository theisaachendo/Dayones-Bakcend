import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class CognitoService {
  private cognito: AWS.CognitoIdentityServiceProvider;
  private clientId = process.env.COGNITO_CLIENT_ID; // Replace with your App Client ID

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

  async signUp(
    username: string,
    password: string,
    role: string,
    fullName: string,
    phoneNumber: string,
  ) {
    const params = {
      ClientId: this.clientId || '',
      SecretHash: this.computeSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email', // Standard Cognito attribute for email
          Value: username, // Assuming username is an email
        },
        {
          Name: 'custom:full_name', // Custom attribute for full name
          Value: fullName,
        },
        {
          Name: 'custom:role', // Custom attribute for role
          Value: role,
        },
        {
          Name: 'custom:phone_number', // Custom attribute for role
          Value: phoneNumber,
        },
      ],
    };

    try {
      const result = await this.cognito.signUp(params).promise();
      return result;
    } catch (error) {
      console.log('🚀 ~ CognitoService ~ error:', error);
      throw error;
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
      console.log('🚀 ~ CognitoService ~ error:', error);
      throw error;
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

  async signOut(accessToken: string) {
    const params = {
      AccessToken: accessToken,
    };
    try {
      // Global sign out logs the user out from all devices
      const result = await this.cognito.globalSignOut(params).promise();
      return result; // Successfully signed out
    } catch (error) {
      console.log('🚀 ~ CognitoService ~ signOut error:', error);
      throw new UnauthorizedException(`Sign out failed: ${error.message}`);
    }
  }
}
