import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { bookingValidationSchemas } from './booking.validation';
import { bookingController } from './booking.controller';
import { USER_ROLE } from '../user/user.canstance';
import auth from '../../middleware/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(bookingValidationSchemas.createBookingValidationSchema),
  bookingController.CreateBooking,
);
router.get('/', auth(USER_ROLE.admin), bookingController.getAllBooking);
router.get('/total-sale', auth(USER_ROLE.admin), bookingController.TotalSale);
router.get(
  '/totalbuy',
  auth(USER_ROLE.user),
  bookingController.getBookingByUser,
);
router.get('/user', auth(USER_ROLE.user,USER_ROLE.admin), bookingController.getmyBooking);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  bookingController.getSingleBooking,
);
router.patch(
  '/:id/status',
  auth(USER_ROLE.admin),
  validateRequest(bookingValidationSchemas.updateBookingStatusValidationSchema),
  bookingController.updateBookingStatus,
);
router.patch(
  '/:id/cancel',
  auth(USER_ROLE.admin, USER_ROLE.user),
  bookingController.cancelBooking,
);
router.put('/:id', auth(USER_ROLE.admin), bookingController.deliverBooking);

export const bookings = router;
