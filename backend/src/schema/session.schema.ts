import {object, string} from 'zod';

export const loginSchema = object({
    email: string({
        required_error: 'Email is required'
    }).email('Not a valid email address'),
    password: string({
        required_error: 'Password is required'
    })
});