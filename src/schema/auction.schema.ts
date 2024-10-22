import { object, string, TypeOf, number } from "zod";

export const payload = ({
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
        }),
        image: string({
            required_error: "image is required",
        })
    })
});

const params = {
    body: object({
      auctionId: string({
        required_error: "auctionId is required",
      }),
    }),
};

export const createAuctionSchema = object({
    ...payload,
});

export const getAuctionSchema = object({
    ...params,
});

export const updateAuctionSchema = object({
    ...payload,
    ...params,
});

export type CreateAuctionInput = TypeOf<typeof createAuctionSchema>;
export type UpdateAuctionInput = TypeOf<typeof updateAuctionSchema>;
export type GetAuctionInput = TypeOf<typeof getAuctionSchema>;