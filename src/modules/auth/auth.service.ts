import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  AuthResponseDto,
} from '../../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone, address } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      name,
      phone,
      role: UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = {
      email: savedUser.email,
      sub: savedUser.UserID,
      role: savedUser.role,
    };
    const token = this.jwtService.sign(payload);

    // Get user with addresses relation
    const userWithAddresses = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['addresses'],
    });

    // Get default address or first address
    const defaultAddress = userWithAddresses?.addresses?.find(addr => addr.is_default) || userWithAddresses?.addresses?.[0];
    const addressString = defaultAddress ? `${defaultAddress.line1}${defaultAddress.line2 ? ', ' + defaultAddress.line2 : ''}, ${defaultAddress.state} ${defaultAddress.zip}, ${defaultAddress.country}` : undefined;

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phone: savedUser.phone,
        address: addressString,
        image: savedUser.image,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
      relations: ['addresses'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get default address or first address
    const defaultAddress = user.addresses?.find(addr => addr.is_default) || user.addresses?.[0];
    const addressString = defaultAddress ? `${defaultAddress.line1}${defaultAddress.line2 ? ', ' + defaultAddress.line2 : ''}, ${defaultAddress.state} ${defaultAddress.zip}, ${defaultAddress.country}` : undefined;

    // Generate JWT token
    const payload = { email: user.email, sub: user.UserID, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: addressString,
        image: user.image,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId, is_active: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId, is_active: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(user);

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { UserID: userId, is_active: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // TODO: Generate reset token and send email
    // For now, just return success message
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }
}

