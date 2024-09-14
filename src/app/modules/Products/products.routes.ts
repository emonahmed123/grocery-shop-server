import express from 'express';
import validateRequest from '../../middleware/validateRequest';

import { ProductController } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.canstance';
import { productValidations } from './products.validation';

const router = express.Router();

router.get('/:id', ProductController.getSingle);
router.post(
  '/',
  validateRequest(productValidations.productValidationSchema),
  ProductController.creatProduct,
);

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(productValidations.productValidationSchema),
  ProductController.updateProduct,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(productValidations.productValidationSchema),
  ProductController.deleteProduct,
);

router.delete('/:id', ProductController.deleteProduct);

router.get('/', ProductController.getAllProduct);

export const productRouter = router;
