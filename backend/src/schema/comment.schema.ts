import { object, string, TypeOf } from "zod";

export const createCommentSchema = object({
    body: object({
        comment: string({required_error: "The comment is required"})
    }),
    params: object({
        auctionId: string({required_error: "The auction is required"})
    })
});

export type CreateCommentInput = TypeOf<typeof createCommentSchema>;