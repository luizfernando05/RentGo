import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../../infra/config/auth';

module.exports = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.headers['authorization'];

  if (authToken != undefined) {
    const bearer = authToken.split(' ');
    if (bearer.length !== 2 || bearer[0] !== 'Bearer') {
      return res.status(403).json({ message: 'Você não está autenticado' });
    }

    const token = bearer[1];

    try {
      verify(token, JWT_SECRET);
      next();
    } catch (error) {
      //no-unused-vars
      let err = error;
      res.status(403).json({ message: 'Token inválido ou expirado' });
      return;
    }
  } else {
    res.status(403).json({ message: 'Você não está autenticado' });
  }
};
