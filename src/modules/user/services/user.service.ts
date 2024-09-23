import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES } from 'src/shared/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create User
   *
   * @param registerUserInput
   * @returns {User}
   */
  async createUser(body: {
    full_name: string;
    email: string;
    phone_number: string;
    role: ROLES;
  }): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: body?.email },
      });

      if (existingUser) {
        throw new HttpException(
          `User with Email: ${body.email} already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
      // Ensure the role is an array, as per the entity definition
      const newUser = this.userRepository.create({
        ...body,
        role: [body.role], // Wrap the role in an array
      });

      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      console.error(
        '🚀 ~ file: user.service.ts:96 ~ UserService ~ registerUser ~ error:',
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch all users
   *
   * @returns {User}
   */
  async fetchAllUsers(): Promise<User[]> {
    try {
      const users: User[] = await this.userRepository.find();
      if (users.length == 0) {
        throw new HttpException('No Users found', HttpStatus.NOT_FOUND);
      }
      return users;
    } catch (error) {
      console.error(
        '🚀 ~ file: user.service.ts ~ UserService ~ fetchAllUsers ~ error:',
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch a user for the given Id
   *
   * @param id
   * @returns {User}
   */
  async findUserById(id: string): Promise<User> {
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new HttpException(
          `User with id : ${id} not found`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return user;
    } catch (error) {
      console.error(
        '🚀 ~ file: user.service.ts ~ UserService ~ findUserById ~ error:',
        error,
      );
      throw error;
    }
  }

  /**
   * Service to delete User.
   *
   * @param id
   * @returns {boolean}
   */
  async deleteUserById(id: string): Promise<boolean> {
    try {
      const user: User | null = await this.userRepository.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      await this.userRepository.delete({
        id: id,
      });
      return true;
    } catch (err) {
      console.error('🚀 ~ UserService ~ deleteUserById ~ err:', err);
      throw err;
    }
  }
}
