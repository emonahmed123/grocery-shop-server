import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { bookings } from '../modules/Booking/booking.routes';

import { productRouter } from '../modules/Products/products.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { CategoryRoutes } from '../modules/Category/category.routes';
import { StatsRoutes } from '../modules/Stats/stats.routes';
import { FlashSaleRoutes } from '../modules/FlashSale/flashSale.routes';

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
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/stats',
    route: StatsRoutes,
  },
  {
    path: '/flash-sales',
    route: FlashSaleRoutes,
  },
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
