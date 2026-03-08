import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1772928509734 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE users
        (
            id         SERIAL PRIMARY KEY,
            email      varchar NOT NULL UNIQUE,
            created_at timestamp DEFAULT now()
        )
    `);

    await queryRunner.query(`
        CREATE TABLE accounts
        (
            id         SERIAL PRIMARY KEY,
            user_id    SERIAL NOT NULL,
            balance    numeric(15, 2) DEFAULT 0,
            created_at timestamp      DEFAULT now(),

            CONSTRAINT fk_user
                FOREIGN KEY (user_id)
                    REFERENCES users (id)
                    ON DELETE CASCADE,

            CONSTRAINT balance_positive
                CHECK (balance >= 0)
        )
    `);

    await queryRunner.query(`
        CREATE TABLE transactions
        (
            id              SERIAL PRIMARY KEY,
            type            varchar        NOT NULL,
            amount          numeric(15, 2) NOT NULL,

            from_account_id SERIAL,
            to_account_id   SERIAL           NOT NULL,

            created_at      timestamp DEFAULT now(),

            FOREIGN KEY (from_account_id) REFERENCES accounts (id),
            FOREIGN KEY (to_account_id) REFERENCES accounts (id)
        )
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE transactions`);
    await queryRunner.query(`DROP TABLE accounts`);
    await queryRunner.query(`DROP TABLE users`);
  }

}
