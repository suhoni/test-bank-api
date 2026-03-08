import { IsInt, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsInt()
  fromAccountId: number;

  @IsInt()
  toAccountId: number;

  @IsNumber({maxDecimalPlaces: 2})
  @Min(0.01)
  amount: number;
}