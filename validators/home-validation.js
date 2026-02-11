import {z} from "zod";

export const homePageSchema = z.object({
    url:z.string().url({ message: "Invalid URL format" }),
    shortCode:z.string()
    .min(3, { message: "Shortcode must be at least 3 characters" })
    .max(10, { message: "Shortcode must be 10 characters or less" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Shortcode must be alphanumeric" }),
})
