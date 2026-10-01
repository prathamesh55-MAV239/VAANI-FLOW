import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long' }).max(100),
  email: z.string().trim().email({ message: 'Please provide a valid email address' }).toLowerCase(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please provide a valid email address' }).toLowerCase(),
  password: z.string().min(1, { message: 'Password is required' }),
});
