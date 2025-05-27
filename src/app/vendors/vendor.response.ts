import { Prisma } from '@prisma/client';
import dayjs from 'dayjs'; // npm install dayjs
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export const vendorSelect = {
  id: true,
  avatar: true,
  subCategoryId: true,
  mainCategoryId: true,
  vendor: {
    select: {
      id: true,
      name: true,
      cover: true,
      rate: true,
      reviewsCount: true,
      deliveryCost: true,
      deliveryCostOffer: true,
      hasOffer: true,
      offerName: true,
      pickUp: true,
      weekTimes: true,
      orderTime: true,
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
  const now = dayjs(); // current time
  const dayKey = now.format('dddd').toLowerCase(); // e.g. "monday"
  const { weekTimes } = vendor.vendor;

  // Parse JSON string if necessary
  const parsedTimes =
    typeof weekTimes === 'string' ? JSON.parse(weekTimes) : weekTimes;

  if (!parsedTimes?.[dayKey]) return false;
  let isOpen = false;

  const from = dayjs(parsedTimes[dayKey].from, 'hh:mm a');
  const to = dayjs(parsedTimes[dayKey].to, 'hh:mm a');

  if (now.isAfter(from) && now.isBefore(to)) {
    isOpen = true;
  }
  const vendorReformed = {
    id: vendor.id,
    avatar: vendor.avatar,
    subCategoryId: vendor.subCategoryId,
    mainCategoryId: vendor.mainCategoryId,
    ...vendor.vendor,
    status: isOpen ? 'OPEN' : 'CLOSED',
  };
  return vendorReformed;
};
