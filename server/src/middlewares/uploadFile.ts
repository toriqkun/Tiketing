import { Request, Response, NextFunction } from 'express';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  next();
};
