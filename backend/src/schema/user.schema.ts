import { object, string, TypeOf, z } from "zod";

const createUserSchemaBase = object({
  name: string({
    required_error: "Name is required",
  }),
  password: string({
    required_error: "Password is required",
  }).min(6, "Password too short - should be 6 chars minimum"),
  passwordConfirmation: string({
    required_error: "passwordConfirmation is required",
  }),
  email: string({
    required_error: "Email is required",
  }).email("Not a valid email"),
});

export const createUserSchema = createUserSchemaBase.refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
});

const createUserInputSchema = createUserSchemaBase.omit({
  passwordConfirmation: true,
});

export const getUserSchema = object({
    userId: string({
      required_error: "userId is required",
    }),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;