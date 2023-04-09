import { z } from 'zod'

export const createAppSchema = z.object({
  userId: z.string(),
  icon: z.string().emoji(),
  name: z.string().min(1),
  description: z.string().min(1),
  prompt: z.string().min(1),
})

export const updateToken = z.object({
  count: z.number(),
  userId: z.string().min(1),
})
