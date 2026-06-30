import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@company.com', description: 'Email or username' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
