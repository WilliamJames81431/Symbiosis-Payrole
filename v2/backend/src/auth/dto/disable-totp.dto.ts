import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisableTotpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
