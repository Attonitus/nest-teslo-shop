import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_DATA } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get(META_DATA, context.getHandler());
    
    if(!validRoles) return true;
    if(validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();

    const {roles, fullName} = req.user as User;

    for (const role of roles) {
      if(validRoles.includes(role)){
        return true;
      }
    }
    
    throw new ForbiddenException(`User ${fullName} need a valid role. ${validRoles}`)
  }
}
