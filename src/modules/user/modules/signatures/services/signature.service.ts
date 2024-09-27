import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Signatures } from '../entities/signature.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSignatureInput } from '../dto/types';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(Signatures)
    private signaturesRepository: Repository<Signatures>,
  ) {}

  /**
   *
   * @param createUserSignatureInput
   * @returns
   */
  async createSignatureNotification(
    createUserSignatureInput: CreateUserSignatureInput,
  ): Promise<Signatures> {
    try {
      // Use the upsert method
      const signature = await this.signaturesRepository.save(
        createUserSignatureInput,
      );
      return signature;
    } catch (error) {
      console.error(
        '🚀 ~ file:signature.service.ts:96 ~ NotificationService ~ upsertSignatureNotification ~ error:',
        error,
      );
      throw new HttpException(` ${error?.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSignatureById(id: string, user_id: string): Promise<boolean> {
    try {
      // Delete the signature based on both id and user_id
      const deleteResult = await this.signaturesRepository.delete({
        id: id,
        user_id: user_id,
      });

      // Check if any rows were affected (i.e., deleted)
      if (deleteResult.affected === 0) {
        throw new HttpException(
          `Signature not found or already deleted`,
          HttpStatus.NOT_FOUND,
        );
      }

      return true;
    } catch (err) {
      console.error(
        '🚀 ~ file:signature.service.ts:96 ~ deleteSignatureById  ~ error:',
        err,
      );
      throw err;
    }
  }

  /**
   *
   * @param user_id
   * @returns
   */
  async fetchAllSignatures(user_id: string): Promise<Signatures[]> {
    try {
      const signatures: Signatures[] = await this.signaturesRepository.find({
        where: {
          user_id,
        },
      });
      return signatures;
    } catch (error) {
      console.error(
        '🚀 ~ file:signature.service.ts:96 ~ fetchAllSignatures ~ error:',
        error,
      );
      throw error;
    }
  }
}
