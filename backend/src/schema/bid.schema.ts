import { number, string, object, TypeOf } from "zod";

const bidBaseFields = object({
    body: object({
        amount: number({ required_error: "amount is required" }),
        auctionId: string({ required_error: "auctionId is required" }),
    }),
});

const getBidsParams = object({
    body: object({
        auctionId: string({ required_error: "auctionId is required" }),
    }),
});

export const placeBidSchema = bidBaseFields;
export const getBidsSchema = getBidsParams;

export type PlaceBidInput = TypeOf<typeof placeBidSchema>;
export type GetBidsInput = TypeOf<typeof getBidsSchema>;
