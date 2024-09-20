import { Module } from '@nestjs/common';
import { CognitoService } from './services/cognito.service';
import { CognitoController } from './controllers/cognito.controller';

@Module({
  imports: [],
  controllers: [CognitoController],
  providers: [CognitoService],
  exports: [CognitoService],
})
export class CognitoModule {}
