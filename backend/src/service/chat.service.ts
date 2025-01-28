import { FilterQuery, QueryOptions } from "mongoose";

import sanitize from "mongo-sanitize";
import logger from "../utils/logger";
import ChatModel, {ChatDocument, ChatInput} from "../models/chat.model";

export async function searchChat(query: FilterQuery<ChatDocument>, options: QueryOptions = {lean: true}) {
    try {
        const sanitizedQuery = sanitize(query);
        return await ChatModel.findOne(sanitizedQuery, {}, options)
            .populate({
                path: "participants",
                select: {"name":1, "_id": 0, "avatar":1}
            })
    } catch (e:any) {
        logger.error(e);
    }
}

export async function searchChatsByUser(query: FilterQuery<ChatDocument>, options: QueryOptions = {lean: true}) {
    try {
        const sanitizedQuery = sanitize(query);
        return await ChatModel.find(sanitizedQuery, {}, options)
            .populate({
                path: "participants",
                select: {"name":1, "_id": 0, "avatar":1}
            })
    } catch (e:any) {
        logger.error(e);
    }
}

export async function newChat(newChat: ChatInput) {
    try {
        console.log(newChat);
        const c = await ChatModel.create(newChat);
        console.log(c);
        return c;
    } catch (e: any) {
        logger.error(e);
    }
}