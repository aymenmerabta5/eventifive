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
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    biography: z.any().optional(),
})

export const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    type: z.enum(["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"], {
        errorMap: () => ({ message: "Please select a valid event type" })
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().max(255, "Location must be less than 255 characters").optional(),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export const updateEventSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    type: z.enum(["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"], {
        errorMap: () => ({ message: "Please select a valid event type" })
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().max(255, "Location must be less than 255 characters").optional(),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(1, "Name is required"),
});
