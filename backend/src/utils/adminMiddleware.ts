import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  // Check if user has admin flag
  if (!user.is_admin) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  next();
};
