import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly dataSource: DataSource) {}

  async transfer(dto: TransferDto) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [firstId, secondId] =
        dto.fromAccountId < dto.toAccountId
          ? [dto.fromAccountId, dto.toAccountId]
          : [dto.toAccountId, dto.fromAccountId];

      await queryRunner.query(
        `SELECT id FROM accounts WHERE id = $1 FOR UPDATE`,
        [firstId],
    );
      await queryRunner.query(
        `SELECT id FROM accounts WHERE id = $1 FOR UPDATE`,
        [secondId],
    );

      const fromAccounts = await queryRunner.query(
        `SELECT * FROM accounts WHERE id = $1`,
        [dto.fromAccountId],
    );
      const toAccounts = await queryRunner.query(
        `SELECT * FROM accounts WHERE id = $1`,
        [dto.toAccountId],
    );

      if (!fromAccounts.length) {
        throw new NotFoundException(`Account with id ${dto.fromAccountId} not found`);
      }
      if (!toAccounts.length) {
        throw new NotFoundException(`Account with id ${dto.toAccountId} not found`);
      }

      const fromAccount = fromAccounts[0];

      if (parseFloat(fromAccount.balance) < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      await queryRunner.query(
        `UPDATE accounts SET balance = balance - $1 WHERE id = $2`,
        [dto.amount, dto.fromAccountId],
    );
      await queryRunner.query(
        `UPDATE accounts SET balance = balance + $1 WHERE id = $2`,
        [dto.amount, dto.toAccountId],
    );

      const result = await queryRunner.query(
        `INSERT INTO transactions (type, amount, from_account_id, to_account_id)
         VALUES ('transfer', $1, $2, $3)
         RETURNING *`,
        [dto.amount, dto.fromAccountId, dto.toAccountId],
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

  async getHistory(accountId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const accounts = await queryRunner.query(
        `SELECT id FROM accounts WHERE id = $1`,
        [accountId],
      );

      if (!accounts.length) {
        throw new NotFoundException(`Account with id ${accountId} not found`);
      }

      return queryRunner.query(
        `SELECT * FROM transactions
         WHERE from_account_id = $1 OR to_account_id = $1
         ORDER BY created_at DESC`,
        [accountId],
      );
    } finally {
      await queryRunner.release();
    }
  }
}