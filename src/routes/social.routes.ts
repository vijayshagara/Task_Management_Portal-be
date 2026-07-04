import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { socialMediaUpload } from '../middlewares/upload.middleware';

const router = Router();
const auth = authMiddleware([]);

router.get('/media/:fileId', (req, res, next) => SocialController.getMedia(req, res).catch(next));

router.get('/stories', auth, (req, res, next) => SocialController.getStories(req, res).catch(next));
router.post(
  '/stories',
  auth,
  socialMediaUpload.single('media'),
  (req, res, next) => SocialController.createStory(req, res).catch(next)
);
router.post('/stories/:id/view', auth, (req, res, next) => SocialController.viewStory(req, res).catch(next));
router.get('/stories/:id/views', auth, (req, res, next) => SocialController.getStoryViews(req, res).catch(next));
router.post('/stories/:id/react', auth, (req, res, next) => SocialController.reactStory(req, res).catch(next));

router.get('/marketplace', auth, (req, res, next) => SocialController.getListings(req, res).catch(next));
router.post(
  '/marketplace',
  auth,
  socialMediaUpload.array('photos', 10),
  (req, res, next) => SocialController.createListing(req, res).catch(next)
);
router.get('/marketplace/user/:userId', auth, (req, res, next) => SocialController.getUserListings(req, res).catch(next));
router.get('/marketplace/:id', auth, (req, res, next) => SocialController.getListing(req, res).catch(next));
router.put('/marketplace/:id', auth, (req, res, next) => SocialController.updateListing(req, res).catch(next));
router.post('/marketplace/:id/sold', auth, (req, res, next) => SocialController.markSold(req, res).catch(next));
router.post('/marketplace/:id/save', auth, (req, res, next) => SocialController.saveListing(req, res).catch(next));
router.post('/marketplace/:id/contact', auth, (req, res, next) => SocialController.contactSeller(req, res).catch(next));

router.get('/messages', auth, (req, res, next) => SocialController.getConversations(req, res).catch(next));
router.post('/messages/start/:userId', auth, (req, res, next) => SocialController.startConversation(req, res).catch(next));
router.get('/messages/:id', auth, (req, res, next) => SocialController.getMessages(req, res).catch(next));
router.post('/messages/:id', auth, (req, res, next) => SocialController.sendMessage(req, res).catch(next));

router.get('/notifications', auth, (req, res, next) => SocialController.getNotifications(req, res).catch(next));
router.get('/notifications/unread-count', auth, (req, res, next) => SocialController.getUnreadCount(req, res).catch(next));
router.post('/notifications/read', auth, (req, res, next) => SocialController.markNotificationsRead(req, res).catch(next));

router.get('/search', auth, (req, res, next) => SocialController.search(req, res).catch(next));
router.get('/explore', auth, (req, res, next) => SocialController.explore(req, res).catch(next));

router.get('/settings', auth, (req, res, next) => SocialController.getSettings(req, res).catch(next));
router.put('/settings', auth, (req, res, next) => SocialController.updateSettings(req, res).catch(next));
router.post('/settings/block/:userId', auth, (req, res, next) => SocialController.blockUser(req, res).catch(next));
router.delete('/settings/block/:userId', auth, (req, res, next) => SocialController.unblockUser(req, res).catch(next));

export default router;
