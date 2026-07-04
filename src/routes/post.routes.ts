import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { socialMediaUpload } from '../middlewares/upload.middleware';

const router = Router();
const auth = authMiddleware([]);

router.get('/feed', auth, (req, res, next) => PostController.getFeed(req, res).catch(next));
router.get('/saved', auth, (req, res, next) => PostController.getSavedPosts(req, res).catch(next));
router.get('/user/:userId', auth, (req, res, next) => PostController.getUserPosts(req, res).catch(next));
router.post(
  '/',
  auth,
  socialMediaUpload.array('media', 10),
  (req, res, next) => PostController.createPost(req, res).catch(next)
);
router.get('/:id', auth, (req, res, next) => PostController.getPost(req, res).catch(next));
router.post('/:id/like', auth, (req, res, next) => PostController.likePost(req, res).catch(next));
router.delete('/:id/like', auth, (req, res, next) => PostController.unlikePost(req, res).catch(next));
router.get('/:id/likes', auth, (req, res, next) => PostController.getLikes(req, res).catch(next));
router.get('/:id/comments', auth, (req, res, next) => PostController.getComments(req, res).catch(next));
router.post('/:id/comments', auth, (req, res, next) => PostController.addComment(req, res).catch(next));
router.put('/comments/:commentId', auth, (req, res, next) => PostController.updateComment(req, res).catch(next));
router.delete('/comments/:commentId', auth, (req, res, next) => PostController.deleteComment(req, res).catch(next));
router.post('/:id/save', auth, (req, res, next) => PostController.savePost(req, res).catch(next));
router.delete('/:id/save', auth, (req, res, next) => PostController.unsavePost(req, res).catch(next));

export default router;
