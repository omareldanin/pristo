import { z } from 'zod';

const coerceBooleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('Invalid boolean string');
  });

export const BannerCreateSchema = z.object({
  order: z.coerce.number(),
  active: coerceBooleanFromString,
});

export type BannerCreateType = z.infer<typeof BannerCreateSchema>;

export const BannerUpdateSchema = BannerCreateSchema.partial();

export type BannerUpdateType = z.infer<typeof BannerUpdateSchema>;
