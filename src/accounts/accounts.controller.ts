import { Controller, Post, Body } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, DepositDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  async create(@Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(dto)
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    return this.accountsService.deposit(dto)
  }
}
