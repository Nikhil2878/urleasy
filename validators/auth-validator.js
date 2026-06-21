import { z } from "zod";

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name must be no more than 100 characters." }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be more than 100 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long." })
    .max(100, { message: "Password must be more than 100 characters." }),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be more than 100 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long." })
    .max(100, { message: "Password must be more than 100 characters." }),
});
export const verifyEmailSchema = z.object({
  token: z.string().trim().length(8),
  email: z.string().trim().email(),
});

export const verifyUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name must be no more than 100 characters." }),
});

export const verifyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current Password is required!" }),
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
  });

export const verifyResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
  });
export const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must be no more than 100 characters." }),
});
