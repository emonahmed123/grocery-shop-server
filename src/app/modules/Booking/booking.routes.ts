import express from 'express';
// import validateRequest from '../../middleware/validateRequest';
// import { bookingValidationSchemas } from './booking.validation';
import { bookingController } from './booking.controller';
import { USER_ROLE } from '../user/user.canstance';
import auth from '../../middleware/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.user),

  bookingController.CreateBooking,
);
router.put(
  '/:id',
  auth(USER_ROLE.user),

  bookingController.deleteBooking,
);

router.get('/', auth(USER_ROLE.admin), bookingController.getAllBooking);
router.get('/user',auth(USER_ROLE.user), bookingController.getmyBooking);

export const bookings = router;
