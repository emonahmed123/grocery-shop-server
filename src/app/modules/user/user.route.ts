import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { userValidationSchemas } from './user.validation';
import { userController } from './user.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from './user.canstance';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(userValidationSchemas.signupValidationSchema),
  userController.Createsignup,
);
router.post(
  '/makeadmin',
  auth(USER_ROLE.admin),
  validateRequest(userValidationSchemas.signupValidationSchema),
  userController.Createsignup,
);
router.post(
  '/googleUser',
  validateRequest(userValidationSchemas.loginValidationSchema),
  userController.googleUser,
);
router.post(
  '/login',
  validateRequest(userValidationSchemas.loginValidationSchema),
  userController.loginUser,
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.user),
  userController.getProfile,
);
router.post(
  '/change',
  auth(USER_ROLE.admin, USER_ROLE.user),
  userController.addImage,
);
router.post(
  '/googleUser',
  auth(USER_ROLE.admin, USER_ROLE.user),
  userController.getProfile,
);
router.get('/alluser', userController.allUser);
export const userRoutes = router;
