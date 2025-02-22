import Router from '@koa/router';
import AuthRoutes from './AuthRoutes';

const router = new Router();

router.use(AuthRoutes.routes());

export default router;