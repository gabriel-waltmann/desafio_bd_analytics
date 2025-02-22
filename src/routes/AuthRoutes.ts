import Router from '@koa/router';
import * as authController from '@/controller/AuthController';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import DataSource from '@/database/DataSource';

const router = new Router();

router.post('/auth', authController.signInOrRegister);

router.get('/me', AuthMiddleware, authController.me);

router.patch('/edit-account', AuthMiddleware, authController.editAccount);

router.get('/users', AuthMiddleware, authController.users);

export default router;
