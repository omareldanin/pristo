import { z } from 'zod';

export const AddressCreateSchema = z.object({
  name: z.string().min(3),
  longitudes: z.string().min(3),
  latitude: z.string().min(3),
});

export type AddressCreateType = z.infer<typeof AddressCreateSchema>;

export const AddressUpdateSchema = AddressCreateSchema.partial();

export type AddressUpdateType = z.infer<typeof AddressUpdateSchema>;
