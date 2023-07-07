import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/share/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from 'src/share/services/jwt.service';
import { bcryptCompare, bcryptPassword } from 'src/share/utils/bcrypt';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(data: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { user_name: data.user_name },
    });
    if (!user) {
      throw new HttpException(
        `Not exists ${data.user_name}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log(
      data.password,
      user.password,
      !bcryptCompare(data.password.trim(), user.password.trim()),
    );

    if (!bcryptCompare(data.password.trim(), user.password.trim())) {
      throw new HttpException(`Invalid password`, HttpStatus.UNAUTHORIZED);
    }

    return this.jwtService.sign({
      user_id: user.id,
      user_name: user.user_name,
    });
  }

  async register(data: RegisterDto) {
    data.password = bcryptPassword(data.password);

    const exists = await this.usersRepository.findOne({
      where: { user_name: data.user_name },
    });
    if (exists) {
      throw new HttpException(
        `already exists ${exists.user_name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersRepository.create({ ...data, active: true });
    return await this.usersRepository.save(user);
  }
}
