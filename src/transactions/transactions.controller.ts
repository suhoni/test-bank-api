import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    return this.transactionsService.transfer(dto);
  }

  @Get('history/:accountId')
  async getHistory(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.transactionsService.getHistory(accountId);
  }
}
