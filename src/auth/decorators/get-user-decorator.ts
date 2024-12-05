import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const getUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest();

        const user = req.user;

        if(!user) throw new InternalServerErrorException(`Error: user not found!`);

        if(data === "email") return user.email;

        return user;
    }
);