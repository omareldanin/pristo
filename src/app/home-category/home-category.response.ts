import { Prisma } from '@prisma/client';
import dayjs from 'dayjs'; // npm install dayjs
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

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
          weekTimes: true,
          offerName: true,
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

  const now = dayjs(); // current time
  const dayKey = now.format('dddd').toLowerCase(); // e.g. "monday"
  console.log(now);

  const categoryReformed = {
    ...category,
    vendors: category.vendors
      .filter((v) => {
        const { weekTimes } = v.vendor;

        // Parse JSON string if necessary
        const parsedTimes =
          typeof weekTimes === 'string' ? JSON.parse(weekTimes) : weekTimes;

        if (!parsedTimes?.[dayKey]) return false;

        const from = dayjs(parsedTimes[dayKey].from, 'hh:mm a');
        const to = dayjs(parsedTimes[dayKey].to, 'hh:mm a');

        return now.isAfter(from) && now.isBefore(to);
      })
      .map((v) => ({
        id: v.id,
        avatar: v.avatar,
        ...v.vendor,
        weekTimes: null,
        status: 'OPEN',
      })),
  };
  return categoryReformed;
};
