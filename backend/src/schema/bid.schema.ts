import { number, string, object, TypeOf } from "zod";

export const placeBidSchema = object({
    amount: number({ required_error: "amount is required" }),
    //auctionId: string({ required_error: "auctionId is required" }),
}).strict();

export const getBidsSchema = object({
    auctionId: string({ required_error: "auctionId is required" }),
}).strict();

export type PlaceBidInput = TypeOf<typeof placeBidSchema>;
export type GetBidsInput = TypeOf<typeof getBidsSchema>;
