import { string, object, array, TypeOf } from "zod";

const chatBaseFields = object({
    auctionId: string({ required_error: "auctionId is required" }),
});


export const createChatSchema = chatBaseFields;
export const getChatSchema = chatBaseFields;

export type CreateChatInput = TypeOf<typeof createChatSchema>;
export type GetChatInput = TypeOf<typeof getChatSchema>;
