import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { bookings } from '../modules/Booking/booking.routes';

import { productRouter } from '../modules/Products/products.routes';
import { ReviewRoutes } from '../modules/review/review.routes';

const router = express.Router();

const modulesRoutes = [
  {
    path: '/auth',
    route: userRoutes,
  },
  {
    path: '/product',
    route: productRouter,
  },

  {
    path: '/bookings',
    route: bookings,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
