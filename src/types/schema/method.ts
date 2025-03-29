import { z } from "zod";

export const methodschema = z.object({
  code: z.string().min(2, { message: "Code must be at least 2 characters" }),
  keterangan: z.string(),
  maxExpired: z.number().positive().optional(),
  images: z.string(),
  minExpired: z.number().positive().optional(),
  min: z.number().positive().optional(),
  max: z.number().positive().optional(),
  isActive : z.boolean(),
  tipe: z.string(),
  typeTax: z.enum(['PERCENTAGE', 'FLAT'], {
    required_error: "Please select a tax type"
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  taxAdmin: z.number().positive().optional()
});


export type MethodSchemas =  z.infer<typeof  methodschema>