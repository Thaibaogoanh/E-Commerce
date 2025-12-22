import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JWT_SECRET } from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });

    console.log('[JwtStrategy] Initialized with secret:', JWT_SECRET.substring(0, 10) + '...');
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating payload:', JSON.stringify(payload));

    const user = await this.userRepository.findOne({
      where: { UserID: payload.sub, is_active: true },
    });

    console.log('[JwtStrategy] User found:', user ? `${user.email}` : 'NOT FOUND');

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.UserID,
      email: user.email,
      role: user.role,
      name: user.full_name,
    };
  }
}
