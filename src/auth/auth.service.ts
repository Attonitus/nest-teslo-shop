import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword, hashPassword } from 'src/adapters/bcrypt.adapter';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {

    const {password, ...user} = this.userRepository.create(createUserDto);

    if(!user){
      throw new BadRequestException(`Error creating user`);
    }

    const hashedPassword = hashPassword(password);
    
    try {
      const savedUser = await this.userRepository.save({
        ...user,
        password: hashedPassword
      });

      return {
        id: savedUser.id,
        token: this.getJwtToken({id: savedUser.id})
      };

    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto){
    const {email, password: passwordLogged} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })

    if(!user){
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    const {password, ...restUser} = user;
    
    if(!comparePassword(passwordLogged, password)){
      throw new UnauthorizedException(`Incorrect email or password`);
    }

    return {
      id: restUser.id,
      token: this.getJwtToken({id: restUser.id})
    };
  }

  private getJwtToken(payload: JwtPayload){

    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleError(error: any){
    if(error.code === "23505"){
      throw new BadRequestException(`Error: ${error.detail}`);
    }

    throw new InternalServerErrorException(`Error: internal server exception`);

  }

}
