import { object, string, TypeOf } from "zod";

export const createCommentSchema = object({
    comment: string({required_error: "The comment is required"})
});

export type CreateCommentInput = TypeOf<typeof createCommentSchema>;