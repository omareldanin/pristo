import { z } from 'zod';

const coerceBooleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('Invalid boolean string');
  });

export const MainCategoryCreateSchema = z.object({
  name: z.string().min(5, { message: 'يجب ان يكون الاسم اكثر من 5 حروف' }),
  image: z.string().optional(),
  createdBy: z.string().optional(),
  description: z
    .string()
    .min(3, { message: 'يجب ان يكون الوصف اكثر من 3 حروف' }),
  active: coerceBooleanFromString.optional(),
});

export type MainCategoryCreateType = z.infer<typeof MainCategoryCreateSchema>;

export const MainCategoryUpdateSchema = MainCategoryCreateSchema.partial();

export type MainCategoryUpdateType = z.infer<typeof MainCategoryUpdateSchema>;
