import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.canstance';
import { FlashSaleControllers } from './flashSale.controller';

const router = Router();

// past and current flash sales, for the dashboard
router.get(
  '/history',
  auth(USER_ROLE.admin),
  FlashSaleControllers.getFlashSaleHistory,
);
router.get(
  '/products/:id/summary',
  auth(USER_ROLE.admin),
  FlashSaleControllers.getProductFlashSaleSummary,
);

export const FlashSaleRoutes = router;
