export const BOOKING_STATUS = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const PAYMENT_METHOD = ['cash-on-delivery', 'card'] as const;

export const PAYMENT_STATUS = ['unpaid', 'paid', 'failed', 'refunded'] as const;

export const BOOKING_SEARCHABLE_FIELDS = [
  'items.name',
  'shippingAddress.phone',
  'shippingAddress.district',
];

// same fees the checkout page shows
export const DELIVERY_FEES = {
  insideDhaka: 5,
  outsideDhaka: 10,
} as const;
