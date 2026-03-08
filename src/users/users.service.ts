import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  async createUser(dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(
        `INSERT INTO users (email) VALUES ($1) RETURNING *`,
        [dto.email],
      );
      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

  }
}
