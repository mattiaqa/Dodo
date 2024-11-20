import { object, string, TypeOf, number, preprocess, date } from "zod";

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
        country: string({
            required_error: "country is required",
        }),
        province: string({
            required_error: "province is required",
        }),
        expireDate: preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date) {
                return new Date(arg);
            }
        }, date({
            required_error: "date is required",
        })),
    })
});

const params = {
    body: object({
      auctionId: string({
        required_error: "auctionId is required",
      }),
    }),
};

const searchParams = {
    body: object({
        query: string({
          required_error: "Query is required",
        }),
      }),
}
export const searchAuctionSchema = object({
    ...searchParams,
});

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
export type SearchAuctionInput = TypeOf<typeof searchAuctionSchema>;