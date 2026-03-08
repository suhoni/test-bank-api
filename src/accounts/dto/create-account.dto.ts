import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  userId: number;
}

export class DepositDto {
  @IsInt()
  accountId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}