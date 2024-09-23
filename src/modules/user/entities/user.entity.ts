import { PASSWORD_REGEX, ROLES } from 'src/shared/constants';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

@Entity('user')
@Unique(['email'])
@Unique(['phone_number'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  @IsNotEmpty({ message: 'Full Name cannot be empty' })
  @Length(3, 20, { message: 'Full Name must be between 3 and 10 characters' })
  full_name: string;

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'Phone no is required' })
  @Index()
  phone_number: string;

  @Column({ nullable: true })
  is_confirmed: boolean;

  @Column({ type: 'enum', enum: ROLES, array: true, default: [ROLES.USER] })
  @IsNotEmpty({ message: 'Role is required' })
  role: ROLES[];

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'User Sub is required' })
  @Index()
  user_sub: string;
}
