import { number, string, object, TypeOf } from "zod";

export const payload = {
    body: object({
      price: number({
        required_error: "price is required",
      }),
      auctionId: string({
        required_error: "auctionId is required",
      }),
    }),
};

const params = {
  body: object({
    auctionId: string({
      required_error: "auctionId is required",
    })
  })
}

export const placeBidSchema = object({
    ...payload,
});

export const getBidsSchema = object({
  ...params,
})

export type PlaceBidInput = TypeOf<typeof placeBidSchema>;
export type GetBidsInput = TypeOf<typeof getBidsSchema>;