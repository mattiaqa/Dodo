import { describe } from "node:test";
import { object, string, TypeOf, number } from "zod";

export const createAuctionSchema = object({
    body: object({
        title: string({
            required_error: "Name is required",
        }),
        price: number({
            required_error: "price is required",
        }),
        description: string({
            required_error: "description is required",
        }),
        condition: string({
            required_error: "condition is required",
        })
    })
});

export type CreateAuctionInput = TypeOf<typeof createAuctionSchema>;