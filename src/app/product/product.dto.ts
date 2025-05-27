import { z } from 'zod';

const coerceBooleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('Invalid boolean string');
  });

export const ProductCreateSchema = z.object({
  name: z.any(),
  description: z.any(),
  image: z.string().optional(),
  price: z.coerce.number(),
  vendorId: z.coerce.number(),
  productCategoryId: z.coerce.number(),
  available: coerceBooleanFromString.optional(),
});

export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;

// const SubCategorySchema = z.union([
//   z.array(z.number()),
//   z.string().transform((val) => JSON.parse(val) as number[]),
// ]);
// export const ProductFilterSchema = z.object({
//   status: z.nativeEnum(ProductStatus).optional(),
//   phone: z.string().optional(),
//   longitudes: z.string().optional(),
//   latitude: z.string().optional(),
//   rate: coerceBooleanFromString.optional(),
//   time: coerceBooleanFromString.optional(),
//   size: z.string().optional(),
//   page: z.string().optional(),
//   feature: coerceBooleanFromString.optional(),
//   hasOffer: coerceBooleanFromString.optional(),
//   pickUp: coerceBooleanFromString.optional(),
//   active: coerceBooleanFromString.optional(),
//   mainCategoryId: z.coerce.number().optional(),
//   homeCategoryId: z.coerce.number().optional(),
//   subCategoryId: SubCategorySchema.optional(),
// });

// export type ProductFiltersType = z.infer<typeof ProductFilterSchema>;
