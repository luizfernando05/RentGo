import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth/LoginService';

class AuthController {
  public async create(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const authService = new AuthService();

      const token = await authService.execute({
        email,
        password,
      });

      return res.json(token);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }
}

module.exports = new AuthController();
