import { Router } from 'express';
import { ReviewControllers } from './review.controller';
import { USER_ROLE } from '../user/user.canstance';
import auth from '../../middleware/auth';

const router = Router();

router.get('/:id', ReviewControllers.getReviews);
// create a review
router.post('/', auth(USER_ROLE.user), ReviewControllers.createReview);

export const ReviewRoutes = router;
