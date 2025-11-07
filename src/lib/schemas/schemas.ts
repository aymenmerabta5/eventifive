import { z } from "zod";

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})

export const setPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const changeEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
})