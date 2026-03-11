import { z } from "zod";

/**
 * Validators for critical forms using Zod
 */

export const CreateOfferSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .default(""),
  budgetTON: z
    .number()
    .positive("Budget must be greater than 0")
    .max(1000000, "Budget seems too large"),
  stack: z.array(z.string()).optional().default([]),
  deadline: z.string().optional().default(""),
});

export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;

export const ApplyToOfferSchema = z.object({
  offerId: z.string().min(1, "Offer ID is required"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters")
    .optional()
    .default(""),
});

export type ApplyToOfferInput = z.infer<typeof ApplyToOfferSchema>;

export const ReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .max(500, "Comment must be less than 500 characters")
    .optional()
    .default(""),
  revieweeAddress: z.string().min(1, "Reviewee address is required"),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["in_progress", "confirm", "complete", "cancel"]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// Helper function to validate form data
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { form: "An unexpected error occurred" },
    };
  }
}
