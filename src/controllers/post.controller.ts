import { Response } from 'express';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';
import { PostService } from '../services/post.service';

export class PostController {
  public static async createPost(req: AuthenticatedRequest, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const post = await PostService.createPost(getUserId(req), req.body, files);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getFeed(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const feed = await PostService.getFeed(getUserId(req), page, limit);
      res.json(feed);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getPost(req: AuthenticatedRequest, res: Response) {
    try {
      const post = await PostService.getPostById(req.params.id, req.user?.id);
      res.json(post);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public static async getUserPosts(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const posts = await PostService.getUserPosts(
        req.params.userId,
        getUserId(req),
        page
      );
      res.json(posts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async likePost(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await PostService.likePost(getUserId(req), req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async unlikePost(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await PostService.unlikePost(getUserId(req), req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getLikes(req: AuthenticatedRequest, res: Response) {
    try {
      const likes = await PostService.getPostLikes(req.params.id);
      res.json(likes);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      const comment = await PostService.addComment(getUserId(req), req.params.id, req.body);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getComments(req: AuthenticatedRequest, res: Response) {
    try {
      const comments = await PostService.getComments(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateComment(req: AuthenticatedRequest, res: Response) {
    try {
      const comment = await PostService.updateComment(
        getUserId(req),
        req.params.commentId,
        req.body.content
      );
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async deleteComment(req: AuthenticatedRequest, res: Response) {
    try {
      await PostService.deleteComment(getUserId(req), req.params.commentId);
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async savePost(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await PostService.savePost(getUserId(req), req.params.id, req.body.collectionName);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async unsavePost(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await PostService.unsavePost(getUserId(req), req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getSavedPosts(req: AuthenticatedRequest, res: Response) {
    try {
      const posts = await PostService.getSavedPosts(getUserId(req));
      res.json(posts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default PostController;
