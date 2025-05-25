import { z } from 'zod';

const coerceBooleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('Invalid boolean string');
  });

export const HomeCategoryCreateSchema = z.object({
  name: z.string().min(5, { message: 'يجب ان يكون الاسم اكثر من 5 حروف' }),
  image: z.string().optional(),
  order: z.coerce.number(),
  createdBy: z.string().optional(),
  active: coerceBooleanFromString.optional(),
});

export type HomeCategoryCreateType = z.infer<typeof HomeCategoryCreateSchema>;

export const HomeCategoryUpdateSchema = HomeCategoryCreateSchema.partial();

export type HomeCategoryUpdateType = z.infer<typeof HomeCategoryUpdateSchema>;
