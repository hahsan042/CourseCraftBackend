import express from 'express';
import { AiRoutes } from './ai.route';

import { UserRoutes } from './user.route';
import { TransactionRoutes } from './transaction.route';
import { CourseRoutes } from './course.route';
import { AdminRoutes } from './admin.route';


const router = express.Router();

const moduleRoutes = [
  {
    path: '/courses',
    route: CourseRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
    {
    path: '/transactions',
    route: TransactionRoutes,
  },
  {
    path: '/ai',
    route: AiRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
