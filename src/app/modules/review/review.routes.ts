import { Router } from 'express';
import { ReviewControllers } from './review.controller';
import { USER_ROLE } from '../user/user.canstance';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { reviewValidationSchemas } from './review.validation';

const router = Router();

// fixed paths first, so they are not caught by '/:id'
router.get(
  '/:id/eligibility',
  auth(USER_ROLE.user, USER_ROLE.admin),
  ReviewControllers.getReviewEligibility,
);
router.get('/:id', ReviewControllers.getReviews);
// a customer reviews a product they bought
router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(reviewValidationSchemas.createReviewValidationSchema),
  ReviewControllers.createReview,
);

export const ReviewRoutes = router;
