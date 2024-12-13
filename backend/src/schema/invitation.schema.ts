import { object, string } from 'zod';

export const InvitationInputSchema = object({
    body: object({
        email: string({required_error: "The email is required"}).email("You have not inserted a valid email")
    }).strict(),  
});
