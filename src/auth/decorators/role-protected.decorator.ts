import { SetMetadata } from '@nestjs/common';

export const META_DATA = "roles";

export const RoleProtected = (...args: string[]) => {

    return SetMetadata(META_DATA, args)
};
