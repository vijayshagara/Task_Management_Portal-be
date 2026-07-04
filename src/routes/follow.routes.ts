import { Router } from 'express';
import { FollowController } from '../controllers/follow.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const auth = authMiddleware([]);

router.get('/requests', auth, (req, res, next) => FollowController.getPendingRequests(req, res).catch(next));
router.post('/:userId', auth, (req, res, next) => FollowController.follow(req, res).catch(next));
router.delete('/:userId', auth, (req, res, next) => FollowController.unfollow(req, res).catch(next));
router.post('/requests/:requestId/respond', auth, (req, res, next) => FollowController.respond(req, res).catch(next));
router.get('/:userId/followers', auth, (req, res, next) => FollowController.getFollowers(req, res).catch(next));
router.get('/:userId/following', auth, (req, res, next) => FollowController.getFollowing(req, res).catch(next));

export default router;
