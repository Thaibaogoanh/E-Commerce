import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address (unique)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '+84123456789',
    description: 'Phone number (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password',
  })
  @IsString()
  password: string;
}

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    example: '+84123456789',
    description: 'Phone number (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar image URL (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldpassword123',
    description: 'Current password',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newpassword456',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AuthResponseDto {
  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: { enum: Object.values(UserRole) },
      phone: { type: 'string' },
      address: { type: 'string' },
      image: { type: 'string' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    address?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token for authentication',
  })
  token: string;
}
