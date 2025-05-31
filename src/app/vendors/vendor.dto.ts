import { VendorStatus } from '@prisma/client';
import { z } from 'zod';

const coerceBooleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('Invalid boolean string');
  });

export const VendorCreateSchema = z.object({
  name: z.string().min(5, { message: 'يجب ان يكون الاسم اكثر من 5 حروف' }),
  phone: z.string().min(5, { message: 'يجب ان يكون الهاتف اكثر من 5 حروف' }),
  password: z
    .string()
    .min(6, { message: 'يجب ان يكون الرقم السري اكبر من 6 حروف' }),
  status: z.nativeEnum(VendorStatus).optional(),
  location: z.string().optional(),
  longitudes: z.string().optional(),
  latitude: z.string().optional(),
  avatar: z.string().optional(),
  weekTimes: z.any().optional(),
  cover: z.string().optional(),
  feature: coerceBooleanFromString,
  active: coerceBooleanFromString,
  deliveryCost: z.coerce.number(),
  deliveryCostOffer: z.coerce.number().optional(),
  hasOffer: coerceBooleanFromString.optional(),
  pickUp: coerceBooleanFromString,
  orderTime: z.coerce.number(),
  mainCategoryId: z.coerce.number(),
  homeCategoryId: z.coerce.number(),
  subCategoryId: z.coerce.number(),
  offerName: z.any().optional(),
});

export type VendorCreateType = z.infer<typeof VendorCreateSchema>;

export const VendorUpdateSchema = VendorCreateSchema.partial();

export type VendorUpdateType = z.infer<typeof VendorUpdateSchema>;

const SubCategorySchema = z.union([
  z.array(z.number()),
  z.string().transform((val) => JSON.parse(val) as number[]),
]);
export const VendorFilterSchema = z.object({
  status: z.nativeEnum(VendorStatus).optional(),
  phone: z.string().optional(),
  longitudes: z.string().optional(),
  latitude: z.string().optional(),
  rate: coerceBooleanFromString.optional(),
  time: coerceBooleanFromString.optional(),
  size: z.string().optional(),
  page: z.string().optional(),
  feature: coerceBooleanFromString.optional(),
  hasOffer: coerceBooleanFromString.optional(),
  pickUp: coerceBooleanFromString.optional(),
  active: coerceBooleanFromString.optional(),
  mainCategoryId: z.coerce.number().optional(),
  homeCategoryId: z.coerce.number().optional(),
  subCategoryId: SubCategorySchema.optional(),
});

export type VendorFiltersType = z.infer<typeof VendorFilterSchema>;
