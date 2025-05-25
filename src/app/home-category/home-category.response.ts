import { Prisma } from '@prisma/client';

export const categorySelect = {
  id: true,
  image: true,
  name: true,
  order: true,
  active: true,
  vendors: {
    select: {
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
        },
      },
    },
  },
} satisfies Prisma.HomeCategorySelect;

export const categoryReform = (
  category: Prisma.HomeCategoryGetPayload<{
    select: typeof categorySelect;
  }> | null,
) => {
  if (!category) {
    return null;
  }
  const categoryReformed = {
    ...category,
    vendors: category.vendors.map((v) => {
      return {
        id: v.id,
        avatar: v.avatar,
        ...v.vendor,
      };
    }),
  };
  return categoryReformed;
};
