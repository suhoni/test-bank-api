import { IsInt, Min } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  userId: number;
}

export class DepositDto {
  @IsInt()
  accountId: number;

  @Min(0.01)
  amount: number;
}