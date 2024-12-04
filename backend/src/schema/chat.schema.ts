import { string, object, array, TypeOf } from "zod";

const chatBaseFields = object({
    body: object({
        auctionId: string({ required_error: "auctionId is required" }),
    }),
});

const getChatParams = object({
    body: object({
        auctionId: string({
            required_error: "AuctionId is required",
        })
    }),
});

export const createChatSchema = chatBaseFields;
export const getChatSchema = getChatParams;

export type CreateChatInput = TypeOf<typeof createChatSchema>;
export type GetChatInput = TypeOf<typeof getChatSchema>;
