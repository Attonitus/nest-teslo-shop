import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from './decorators/get-user-decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { validRoles } from './interfaces/validRoles';
import { Auth } from './decorators/auth.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@getUser() user: User){
    return this.authService.checkStatus(user);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  private( 
  @getUser() user : User, 
  @getUser('email') email: string, 
  @RawHeaders() rawHeaders: string[],
  @Headers() headers: IncomingHttpHeaders,
  ){

    return{
      ok: true,
      msg: "Hellow from private",
      user,
      email,
      rawHeaders,
      headers
    }
  }

  
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected( validRoles.admin )
  @UseGuards( AuthGuard(), UserRoleGuard )
  private2( @getUser() user: User ){
    return{
      ok: true,
      user
    }
  }


  @Get('private3')
  @Auth(validRoles.admin)
  private3( @getUser() user: User ){
    return{
      ok: true,
      user
    }
  }
}
