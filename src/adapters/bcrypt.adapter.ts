import {hashSync, compareSync} from 'bcrypt'

export const hashPassword = (password: string, salt = 10): string => {
    return hashSync(password, salt);
}

export const comparePassword = (password: string, hashedPass: string): boolean => {
    return compareSync(password, hashedPass);
}