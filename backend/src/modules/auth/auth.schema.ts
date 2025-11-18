import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(5).max(18).optional(),
  grade: z.string().optional(),
  school: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().min(5).max(18).optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  knowledgeLevel: z.string().optional()
});

export const xpSchema = z.object({
  amount: z.number().min(1).max(1000)
});

