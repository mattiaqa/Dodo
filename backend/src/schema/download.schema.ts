import { object, string, TypeOf } from "zod";

export const downloadImageSchema = object({
    params: object({
        filename: string({required_error: "filename is required"})
    })
});

export type DownloadImageInput = TypeOf<typeof downloadImageSchema>;