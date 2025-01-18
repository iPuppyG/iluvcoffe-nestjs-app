import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({
    description: 'The name of a coffee',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the brand of a coffee',
  })
  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @ApiProperty({
    description: 'The flavors of a coffee',
    example: ['vanilla', 'chocolate', 'caramel'],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly flavors: string[];
}
