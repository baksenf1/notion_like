import { z } from "zod";

export const pageIdSchema = z.string().trim().min(1);

export const createPageSchema = z.object({
  title: z.string().trim().max(255).optional(),
  content: z.string().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().trim().max(255).optional(),
  content: z.string().optional(),
});
