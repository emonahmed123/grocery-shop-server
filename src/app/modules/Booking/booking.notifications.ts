import config from '../../config';
import sendEmail from '../../utils/sendEmail';
import {
  orderPlacedTemplate,
  orderStatusTemplate,
} from '../../utils/emailTemplates';
import { User } from '../user/user.model';
import { TBooking } from './booking.interface';

type TBookingDoc = TBooking & { _id: { toString(): string } };

// the same short id the store shows, e.g. #B56811
const toOrderNo = (id: string) => `#${id.slice(-6).toUpperCase()}`;

// CLIENT_URL is the store's address; older setups only have the reset link,
// whose origin is the same store
const getOrdersLink = () => {
  const base = config.client_url || config.reset_pass_ui_link;
  if (!base) return undefined;
  try {
    return new URL('/my-account/orders', base).toString();
  } catch {
    return undefined;
  }
};

const getCustomer = (userId: TBooking['userId']) =>
  User.findById(userId).select('name email').lean();

// an email problem is logged but never fails the order itself
const notify = async (
  booking: TBookingDoc,
  subject: string,
  build: (name: string) => string,
) => {
  try {
    const customer = await getCustomer(booking.userId);
    if (!customer?.email) return;

    await sendEmail({
      to: customer.email,
      subject,
      html: build(customer.name),
    });
  } catch (err) {
    console.error(`Order email for ${booking._id.toString()} failed:`, err);
  }
};

export const sendOrderPlacedEmail = (booking: TBookingDoc) => {
  const orderNo = toOrderNo(booking._id.toString());

  return notify(booking, `Order ${orderNo} received - BoroBazar`, (name) =>
    orderPlacedTemplate({
      orderNo,
      customerName: name,
      items: booking.items,
      subTotal: booking.subTotal,
      deliveryFee: booking.deliveryFee,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod,
      shippingAddress: booking.shippingAddress,
      ordersLink: getOrdersLink(),
    }),
  );
};

export const sendOrderStatusEmail = (booking: TBookingDoc) => {
  const orderNo = toOrderNo(booking._id.toString());

  return notify(
    booking,
    `Order ${orderNo} is ${booking.status} - BoroBazar`,
    (name) => orderStatusTemplate(name, orderNo, booking.status, getOrdersLink()),
  );
};
