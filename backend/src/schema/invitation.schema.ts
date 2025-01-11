import { object, string } from 'zod';

export const invitationSchema = object({
        email: string({required_error: "The email is required"}).email("You have not inserted a valid email")
}).strict();

export const acceptInvitationSchema = object({
    token: string({required_error: "The token is required"})
}).strict();