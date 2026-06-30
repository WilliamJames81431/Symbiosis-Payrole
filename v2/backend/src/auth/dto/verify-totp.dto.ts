import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTotpDto {
  @ApiProperty({ description: 'Pre-auth token from login step' })
  @IsString()
  @IsNotEmpty()
  preAuthToken: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 8) // 6 for TOTP, 8 for backup codes
  code: string;
}
