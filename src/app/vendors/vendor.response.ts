import { Prisma } from '@prisma/client';

export const vendorSelect = {
  id: true,
  avatar: true,
  vendor: {
    select: {
      deliveryCost: true,
      deliveryCostOffer: true,
      status: true,
      name: true,
      cover: true,
      rate: true,
      pickUp: true,
      hasOffer: true,
      weekTimes: true,
    },
  },
} satisfies Prisma.UserSelect;

export const vendorReform = (
  vendor: Prisma.UserGetPayload<{
    select: typeof vendorSelect;
  }> | null,
) => {
  if (!vendor) {
    return null;
  }
  const vendorReformed = {
    id: vendor.id,
    avatar: vendor.avatar,
    ...vendor.vendor,
  };
  return vendorReformed;
};
