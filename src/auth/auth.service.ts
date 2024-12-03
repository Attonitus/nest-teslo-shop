import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword, hashPassword } from 'src/adapters/bcrypt.adapter';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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

      delete savedUser.password;

      return savedUser;

      // TODO RETURN JWT

    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto){
    const {email, password: passwordLogged} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true }
    })

    if(!user){
      throw new BadRequestException(`Incorrect email or password`);
    }

    const {password, ...restUser} = user;
    
    if(!comparePassword(passwordLogged, password)){
      throw new BadRequestException(`Incorrect email or password`);
    }

    return restUser;
  }

  private handleError(error: any){
    if(error.code === "23505"){
      throw new BadRequestException(`Error: ${error.detail}`);
    }

    throw new InternalServerErrorException(`Error: internal server exception`);

  }

}
