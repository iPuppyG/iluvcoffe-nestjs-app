import { CoffeesService } from './coffees.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PublicAPI } from 'src/common/decorators/public-api.decorator';
import { Protocol } from 'src/common/decorators/protocol.decorator';
import { ApiForbiddenResponse } from '@nestjs/swagger';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @PublicAPI()
  @Get()
  async findAll(
    @Protocol() protocol: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    console.log('protocol', protocol);
    return this.coffeesService.findAll(paginationQuery);
  }

  @PublicAPI()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(id);
  }

  @ApiForbiddenResponse({
    description: 'Forbidden',
    schema: {
      type: 's',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Patch(':id/recommend')
  recommendCoffee(@Param('id') id: string) {
    return this.coffeesService.recommendCoffee(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}
