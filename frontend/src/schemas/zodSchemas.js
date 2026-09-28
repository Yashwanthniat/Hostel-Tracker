import { z } from "zod";

export const complaintSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  category_id: z.coerce.number().int().positive().optional().nullable(),
  room_number: z.string().min(1, "Room number is required").max(10, "Room number too long"),
  photo_url: z.string().optional().nullable().or(z.literal("")),
});

export const statusUpdateSchema = z.object({
  new_status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED_PENDING", "CLOSED", "REOPENED"]),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional().nullable(),
  assigned_staff_id: z.string().uuid().optional().nullable(),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["student", "staff", "admin"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
  room_number: z.string().max(10).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
