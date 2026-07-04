import { Response } from 'express';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';
import { FollowService } from '../services/follow.service';

export class FollowController {
  public static async follow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await FollowService.follow(getUserId(req), req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async unfollow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await FollowService.unfollow(getUserId(req), req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async respond(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await FollowService.respondToRequest(
        getUserId(req),
        req.params.requestId,
        req.body.action
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getFollowers(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await FollowService.getFollowers(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getFollowing(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await FollowService.getFollowing(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getPendingRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const requests = await FollowService.getPendingRequests(getUserId(req));
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default FollowController;
