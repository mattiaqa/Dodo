import { object, string, TypeOf } from "zod";

export const downloadImageSchema = object({
    filename: string({required_error: "filename is required"})
});

export type DownloadImageInput = TypeOf<typeof downloadImageSchema>;