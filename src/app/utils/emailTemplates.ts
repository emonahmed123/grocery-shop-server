export const resetPasswordTemplate = (name: string, resetLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1f2937;">
    <h2 style="color: #02b290;">Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We got a request to reset your password. Click the button below to choose a new one.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}"
         style="background: #02b290; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Reset Password
      </a>
    </p>
    <p>This link works once and expires in 10 minutes.</p>
    <p>If you did not ask for this, you can ignore this email. Your password will stay the same.</p>
  </div>
`;

// customers type the address and note, so every value is escaped before it goes into the html
const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const money = (value: number) => `$${value.toFixed(2)}`;

type TOrderEmail = {
  /** short id the customer sees, e.g. #B56811 */
  orderNo: string;
  customerName: string;
  items: {
    name: string;
    variation?: string;
    quantity: number;
    price: number;
  }[];
  subTotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: { district: string; address: string; phone: string };
  /** link to the customer's orders page, when the frontend url is known */
  ordersLink?: string;
};

const PAYMENT_LABELS: Record<string, string> = {
  'cash-on-delivery': 'Cash on delivery',
  card: 'Card',
};

const ordersButton = (link?: string) =>
  link
    ? `<p style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(link)}"
           style="background: #02b290; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          View my orders
        </a>
      </p>`
    : '';

export const orderPlacedTemplate = (order: TOrderEmail) => {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${escapeHtml(item.name)}${item.variation ? ` (${escapeHtml(item.variation)})` : ''} x ${item.quantity}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${money(item.price * item.quantity)}
          </td>
        </tr>`,
    )
    .join('');

  return `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color: #1f2937;">
    <h2 style="color: #02b290;">Thanks for your order!</h2>
    <p>Hi ${escapeHtml(order.customerName)},</p>
    <p>We got your order <strong>${escapeHtml(order.orderNo)}</strong> and will confirm it soon.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${rows}
      <tr><td style="padding: 8px 0;">Subtotal</td><td style="text-align: right;">${money(order.subTotal)}</td></tr>
      <tr><td style="padding: 8px 0;">Delivery</td><td style="text-align: right;">${money(order.deliveryFee)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Total</td><td style="text-align: right; font-weight: bold;">${money(order.totalAmount)}</td></tr>
    </table>
    <p><strong>Payment:</strong> ${escapeHtml(PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod)}</p>
    <p><strong>Deliver to:</strong> ${escapeHtml(order.shippingAddress.address)}, ${escapeHtml(order.shippingAddress.district)}<br />
      <strong>Phone:</strong> ${escapeHtml(order.shippingAddress.phone)}</p>
    ${ordersButton(order.ordersLink)}
  </div>
`;
};

const STATUS_MESSAGES: Record<string, { title: string; text: string }> = {
  confirmed: {
    title: 'Your order is confirmed',
    text: 'The shop has confirmed your order and is getting it ready.',
  },
  shipped: {
    title: 'Your order is on the way',
    text: 'Your order has left the shop and will reach you soon.',
  },
  delivered: {
    title: 'Your order was delivered',
    text: 'Enjoy your groceries! You can now review the products you bought.',
  },
  cancelled: {
    title: 'Your order was cancelled',
    text: 'This order has been cancelled. If you did not ask for this, please contact us.',
  },
};

export const orderStatusTemplate = (
  customerName: string,
  orderNo: string,
  status: string,
  ordersLink?: string,
) => {
  const message = STATUS_MESSAGES[status];
  return `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; color: #1f2937;">
    <h2 style="color: #02b290;">${escapeHtml(message?.title ?? 'Order update')}</h2>
    <p>Hi ${escapeHtml(customerName)},</p>
    <p>Order <strong>${escapeHtml(orderNo)}</strong>: ${escapeHtml(message?.text ?? `the status is now ${status}.`)}</p>
    ${ordersButton(ordersLink)}
  </div>
`;
};
