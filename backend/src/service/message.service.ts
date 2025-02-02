import sanitize from "mongo-sanitize";
import logger from "../utils/logger";
import MessageModel, {MessageDocument, MessageInput} from "../models/message.model";
import mongoose from "mongoose";

export async function sendMessage(message: MessageInput) {
    try {
        const messageSanitized = sanitize(message);

        const newMessage = await MessageModel.create(messageSanitized);

        return newMessage.toJSON();
    } catch (e: any) {
        logger.error(e);
    }
}

export async function searchMessagesByChatId(chatId: any) {
    try {
        return await MessageModel.find({chatId: chatId}, {content: 1, sender: 1, _id: 0, createdAt: 1})
            .populate({
                path: "sender",
                select: {"name": 1, "_id": 0, "avatar": 1}
            })
    } catch (e: any) {
        logger.error(e);
    }
}