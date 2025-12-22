import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactStatusDto } from '../../dto/contact.dto';
import { Contact } from '../../entities/contact.entity';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact message' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateContactDto,
    @Request() req,
  ): Promise<Contact> {
    const userId = req.user?.id;
    return this.contactService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact messages (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of contact messages retrieved',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.contactService.findAll(page, limit);
  }

  @Get('my-messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my contact messages' })
  @ApiResponse({ status: 200, description: 'Your contact messages' })
  async getMyMessages(@Request() req): Promise<Contact[]> {
    return this.contactService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact message by ID' })
  @ApiResponse({ status: 200, description: 'Contact message found' })
  @ApiResponse({ status: 404, description: 'Contact message not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Contact> {
    return this.contactService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact message status (admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactStatusDto,
  ): Promise<Contact> {
    return this.contactService.updateStatus(id, dto.status, dto.response);
  }
}

