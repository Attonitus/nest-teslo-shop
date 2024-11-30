import { validate } from 'uuid';

export const isValidUuid = (uuid: string) => {
    return validate(uuid);
}