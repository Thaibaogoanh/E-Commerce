import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  UserStatsDto,
} from '../../dto/user.dto';
import { ChangePasswordDto } from '../../dto/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query() queryDto: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usersService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUserStats(): Promise<UserStatsDto> {
    return this.usersService.getUserStats();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(req.user.id, updateUserDto, req.user.id);
  }

  @Patch('profile/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.usersService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@Request() req): Promise<{
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    treesPlanted: number;
  }> {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Get('dashboard/recent-orders')
  @UseGuards(JwtAuthGuard)
  async getRecentOrders(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.usersService.getRecentOrders(
      req.user.id,
      limit ? parseInt(limit.toString()) : 5,
    );
  }

  @Get('dashboard/trees-planted')
  @UseGuards(JwtAuthGuard)
  async getTreesPlanted(
    @Request() req,
  ): Promise<{ count: number; goal: number }> {
    return this.usersService.getTreesPlanted(req.user.id);
  }
}
