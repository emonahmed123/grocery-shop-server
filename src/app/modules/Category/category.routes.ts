import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.canstance';
import { CategoryController } from './category.controller';
import { categoryValidations } from './category.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(categoryValidations.createCategoryValidationSchema),
  CategoryController.createCategory,
);

router.get('/', CategoryController.getAllCategories);
router.get('/:slug', CategoryController.getSingleCategory);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(categoryValidations.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

router.delete('/:id', auth(USER_ROLE.admin), CategoryController.deleteCategory);

export const CategoryRoutes = router;
