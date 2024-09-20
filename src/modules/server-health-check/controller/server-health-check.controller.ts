import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ServerHealthCheckService } from '../services/server-health-check.services';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class ServerHealthController {
  constructor(private serverHealthCheckService: ServerHealthCheckService) {}

  @Get()
  getServerStatus(): string {
    return this.serverHealthCheckService.getServerStatus();
  }
  @Get('exception')
  getException(): string {
    try {
      throw new Error();
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'This is a custom message',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: err,
        },
      );
    }
  }
}
