import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactStatus } from '../entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({ description: 'Full name of the contact person' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Subject of the message' })
  @IsString()
  @MinLength(5)
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @MinLength(10)
  message: string;
}

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus, description: 'New status' })
  @IsEnum(ContactStatus)
  status: ContactStatus;

  @ApiPropertyOptional({ description: 'Response message from admin' })
  @IsOptional()
  @IsString()
  response?: string;
}

export class ContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ContactStatus })
  status: ContactStatus;

  @ApiPropertyOptional()
  response?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
