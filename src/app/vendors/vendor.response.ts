import { Prisma } from '@prisma/client';
import dayjs from 'dayjs'; // npm install dayjs
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export const vendorSelect = {
  id: true,
  avatar: true,
  subCategoryId: true,
  homeCategoryId: true,
  mainCategoryId: true,
  phone: true,
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
      feature: true,
      active: true,
    },
  },
} satisfies Prisma.UserSelect;

export const checkIfOpen = (weekTimes: any) => {
  const now = dayjs(); // current time
  const dayKey = now.format('dddd').toLowerCase(); // e.g. "monday"
  // const { weekTimes } = vendor.vendor;

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
  return isOpen ? 'OPEN' : 'CLOSED';
};

export const vendorReform = (
  vendor: Prisma.UserGetPayload<{
    select: typeof vendorSelect;
  }> | null,
) => {
  if (!vendor) {
    return null;
  }

  const { weekTimes } = vendor.vendor;

  const vendorReformed = {
    id: vendor.id,
    avatar: vendor.avatar,
    phone: vendor.phone,
    subCategoryId: vendor.subCategoryId,
    mainCategoryId: vendor.mainCategoryId,
    homeCategoryId: vendor.homeCategoryId,
    ...vendor.vendor,
    status: checkIfOpen(weekTimes),
  };
  return vendorReformed;
};
