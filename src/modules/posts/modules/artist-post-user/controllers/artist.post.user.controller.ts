import { CognitoGuard } from '@app/modules/auth/guards/aws.cognito.guard';
import { UserService } from '@app/modules/user/services/user.service';
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateArtistPostUserInput,
  UpdateArtistPostUserInput,
} from '../dto/types';
import { ArtistPostUserService } from '../services/artist.post.user.service';
import { Response, Request } from 'express';

@ApiTags('Artist-Post-User')
@Controller('artist-post-user')
@UseGuards(CognitoGuard)
export class ArtistPostUserController {
  constructor(
    private artistPostUserService: ArtistPostUserService,
    private userService: UserService,
  ) {}

  @Post()
  async createArtistPostUser(
    @Body() createArtistPostUserInput: CreateArtistPostUserInput,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const { id: user_id } = await this.userService.findUserByUserSub(
        req?.userSub || '',
      );
      if (!user_id) {
        throw new HttpException(`User not found}`, HttpStatus.NOT_FOUND);
      }
      const response = await this.artistPostUserService.createArtistPostUser({
        ...createArtistPostUserInput,
        user_id,
      });
      res
        .status(HttpStatus.CREATED)
        .json({ message: 'User is update successfully', data: response });
    } catch (error) {
      console.error(
        '🚀 ~ ArtistPostUserController ~ createArtistPostUser ~ error:',
        error,
      );
      throw error;
    }
  }

  @Patch()
  async updateArtistPostUser(
    @Body() updateArtistPostUserInput: UpdateArtistPostUserInput,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const { id: user_id } = await this.userService.findUserByUserSub(
        req?.userSub || '',
      );
      if (!user_id) {
        throw new HttpException(`User not found}`, HttpStatus.NOT_FOUND);
      }
      const response = await this.artistPostUserService.updateArtistPostUser({
        ...updateArtistPostUserInput,
        user_id,
      });
      res
        .status(HttpStatus.CREATED)
        .json({ message: 'Artist Post update Successful', data: response });
    } catch (error) {
      console.error(
        '🚀 ~ ArtistPostUserController ~ updateArtistPostUser ~ error:',
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  async deleteArtistPostUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const { id: user_id } = await this.userService.findUserByUserSub(
        req?.userSub || '',
      );
      if (!user_id) {
        throw new HttpException(`User not found}`, HttpStatus.NOT_FOUND);
      }
      const response =
        await this.artistPostUserService.deleteArtistPostUserById(id, user_id);
      res
        .status(HttpStatus.CREATED)
        .json({
          message: 'Artist Post User delete successful',
          data: response,
        });
    } catch (error) {
      console.error(
        '🚀 ~ ArtistPostUserController ~ deleteArtistPostUser ~ error:',
        error,
      );
      throw error;
    }
  }
}
