import express from 'express';
import validateRequest from '../../middleware/validateRequest';

import { ProductController } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.canstance';
import { productValidations } from './products.validation';

const router = express.Router();

// fixed paths first, so they are not caught by '/:id'
router.get('/', ProductController.getAllProduct);
router.get('/flash-sale', ProductController.getFlashSaleProducts);
router.get('/revenue', ProductController.SelRevenu);
router.get('/:id', ProductController.getSingle);

router.post(
  '/',
   auth(USER_ROLE.admin),
  validateRequest(productValidations.productValidationSchema),
  ProductController.creatProduct,
);
router.post(
  '/flash-sale',
  auth(USER_ROLE.admin),
  validateRequest(productValidations.flashSaleValidationSchema),
  ProductController.setFlashSale,
);

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(productValidations.UpdateproductValidationSchema),
  ProductController.updateProduct,
);

router.delete(
  '/:id/flash-sale',
  auth(USER_ROLE.admin),
  ProductController.removeFlashSale,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin),

  ProductController.deleteProduct,
);

// router.delete('/:id', ProductController.deleteProduct);

export const productRouter = router;
