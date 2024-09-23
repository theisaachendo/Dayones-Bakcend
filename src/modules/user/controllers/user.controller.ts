import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { ROLES } from 'src/shared/constants';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  createUser(
    @Body()
    body: {
      full_name: string;
      email: string;
      phone_number: string;
      role: ROLES;
    },
  ): any {
    return this.userService.createUser(body);
  }
}
