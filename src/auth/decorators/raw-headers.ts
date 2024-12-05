import { createParamDecorator, ExecutionContext } from "@nestjs/common";



export const RawHeaders = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp();
        const json = req.getRequest();

        return json.rawHeaders;
    }
)