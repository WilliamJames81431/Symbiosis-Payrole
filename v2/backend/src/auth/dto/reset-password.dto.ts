import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'Min 12 chars, 1 uppercase, 1 number, 1 special char',
  })
  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*)',
  })
  newPassword: string;
}
