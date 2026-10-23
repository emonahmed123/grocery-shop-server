import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.canstance';
import { StatsController } from './stats.controller';

const router = express.Router();

router.get('/admin', auth(USER_ROLE.admin), StatsController.getAdminStats);

export const StatsRoutes = router;
