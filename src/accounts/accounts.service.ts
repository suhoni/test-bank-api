import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateAccountDto, DepositDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly dataSource: DataSource) {}

  async createAccount(dto: CreateAccountDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const users = await queryRunner.query(
        `SELECT id FROM users WHERE id = $1`
        [dto.userId]
      );
      if (!users.length) {
        throw new NotFoundException(`User with id ${dto.userId} not found.`);
      }
      const result = queryRunner.query(
        `INSERT INTO accounts (user_id) VALUES ($1) RETURNING *`,
        [dto.userId]
      );

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release()
    }
  }

  async deposit(dto: DepositDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accounts = await queryRunner.query(
        `SELECT id FROM accounts WHERE id = $1`,
        [dto.accountId],
      );

      if (!accounts.length) {
        throw new NotFoundException(`Accounts with id ${dto.accountId} not found.`);
      }

      await queryRunner.query(
        `UPDATE accounts SET balance = balance + $1 WHERE id = $2`,
        [dto.amount, dto.accountId]
      );

      const result = await queryRunner.query(
        `INSERT INTO transactions (type, amount, from_account_id, to_account_id)
                VALUES ('deposit', $1, NULL, $2)
                RETURNING *`,
                [dto.amount, dto.accountId],
      );

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release()
    }
  }
}
