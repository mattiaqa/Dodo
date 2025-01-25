import {object, string, TypeOf} from "zod";

const messageBaseFields = object({
    content: string({
        required_error: "Content is required",
    }),
    chatId: string({
        required_error: "chatId is required",
    }),
});

export const sendMessageSchema = messageBaseFields;
export type SendMessageInput = TypeOf<typeof sendMessageSchema>;