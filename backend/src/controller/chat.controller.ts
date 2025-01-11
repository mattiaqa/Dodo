import { Request, Response } from "express";

import logger from "../utils/logger";
import {GetChatInput} from "../schema/chat.schema";
import {SendMessageInput} from "../schema/message.schema";
import {newChat, searchChat, searchChatsByUser} from "../service/chat.service";
import {searchMessagesByChatId, sendMessage} from "../service/message.service";
import {searchAuctionById} from "../service/auction.service";
import {omit} from "lodash";

export async function sendMessageHandler(req: Request<SendMessageInput["body"]>, res: Response) {
    try{
        const sender = res.locals.user!.id;
        const content = req.body.content;
        const chatId = req.body.chatId;

        const message = await sendMessage({sender, content, chatId});

        res.send(omit(message, "__v", "sender", "_id", "createdAt", "updatedAt"));
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getChatHandler(req: Request<GetChatInput['body']>, res: Response) {
    try {
        const auctionId = req.body.auctionId;
        const userId = res.locals.user!.id;

        const auction = await searchAuctionById(auctionId);

        let chat = await searchChat({
            auctionId,
            participants: userId
        });

        if (!chat) {
            chat = await newChat({
                participants: [userId, auction!.seller],
                auctionId
            });
        }

        const messages = await searchMessagesByChatId(chat!._id);

        res.send({
            chat,
            messages
        });
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getUserChatHandler(req: Request, res: Response) {
    try {
        const userId = res.locals.user!.id;

        const chats = await searchChatsByUser({participants: userId});
        res.send(chats);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
