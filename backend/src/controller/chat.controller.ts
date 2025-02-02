import { Request, Response } from "express";

import logger from "../utils/logger";
import {sendMessageSchema} from "../schema/message.schema";
import {newChat, searchChat, searchChatsByUser} from "../service/chat.service";
import {searchMessagesByChatId, sendMessage} from "../service/message.service";
import {getAuctionById} from "../service/auction.service";
import {omit} from "lodash";
import { z } from "zod";

/**
 * Handler to send a message within a chat.
 *
 * Process:
 * - Retrieves the sender's user ID from the request context.
 * - Validates the request body and sends a message in the specified chat.
 * - Returns the sent message, omitting unnecessary fields such as version, sender, and timestamps.
 * - Handles errors and returns an internal server error message if any occur.
 */
export async function sendMessageHandler(req: Request<{},{}, z.infer<typeof sendMessageSchema>>, res: Response) {
    try{
        const sender = res.locals.user!.id;
        const { content, chatId } = req.body;

        const message = await sendMessage({sender, content, chatId});

        res.send(omit(message, "__v", "sender", "_id", "createdAt", "updatedAt"));
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

/**
 * Handler to retrieve the content of a specific chat.
 *
 * Process:
 * - Validates the provided chatId and checks if the user is a participant.
 * - Retrieves the chat and all associated messages.
 * - Returns the chat details along with the messages to the user.
 * - Handles errors and returns an internal server error message if any occur.
 */
export async function getChatContentHandler(req: Request, res: Response) {
    try {
        const { chatId } = req.params;
        const userId = res.locals.user!.id;
        let chat = await searchChat({
            _id: chatId,
            participants: userId
        });

        if(!chatId)
            res.status(404).send({"Error": "No chat found"});

        const messages = await searchMessagesByChatId(chat?._id);

        res.send({
            chat,
            messages,
        });
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

/**
 * Handler to retrieve or create a chat ID associated with a specific auction.
 *
 * Process:
 * - Validates the auction ID and checks if it exists.
 * - Searches for an existing chat for the auction and the user.
 * - If no chat exists, creates a new one and associates the user with the seller.
 * - Returns the chat details to the user.
 * - Handles errors and returns an internal server error message if any occur.
 */
export async function getChatIdHandler(req: Request, res: Response) {
    try {
        const {auctionId} = req.params;
        const userId = res.locals.user!.id;

        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        const chat = await searchChat({
            auctionId,
            participants: userId
        });

        if (!chat) {
            const chat = await newChat({
                participants: [userId, auction!.seller],
                auctionId
            });

            res.send(chat);
            return;
        }

        res.send(chat);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

/**
 * Handler to retrieve all chats associated with a user.
 *
 * Process:
 * - Retrieves all chats where the user is a participant.
 * - For each chat, fetches details about the related auction, such as title and image.
 * - Returns a list of chat details, including auction titles, participants, and avatars.
 * - Handles errors and returns an internal server error message if any occur.
 */
export async function getUserChatHandler(req: Request, res: Response) {
    try {
        const userId = res.locals.user!.id;

        const chats = await searchChatsByUser({participants: userId});

        if(!chats) {
            res.status(404).send({"Error": "No chat found"});
        }

        const chatDetails = await Promise.all(
            chats!.map(async (chat) => {
                const auction = await getAuctionById(chat.auctionId);

                return {
                    chatId: chat._id,
                    auctionTitle: auction?.title,
                    auctionId: auction?.auctionId,
                    participants: chat.participants,
                    avatar: res.locals.user!.avatar,
                    auctionImage: "http://localhost:1338/api/download/image/" + (auction?.images?.[0] || '')
                };
            })
        );

        res.send(chatDetails);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
