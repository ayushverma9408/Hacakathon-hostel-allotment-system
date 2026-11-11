import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores.");

export const createHostelSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  policyCode: z.string().trim().max(64).optional()
});

export const createRoomSchema = z.object({
  buildingId: z.string().trim().min(1),
  code: codeSchema,
  floor: z.number().int().min(0).max(200),
  capacity: z.number().int().min(1).max(100)
});

export type CreateHostelInput = z.infer<typeof createHostelSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
