import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../../../src/infra/config/auth';
const authMiddleware = require('../../../src/http/middleware/Auth');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Auth Middleware', () => {
  const mockNext = jest.fn();
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar next() se o token for válido', () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    } as Partial<Request>;

    (verify as jest.Mock).mockReturnValue({ id: 'user123' });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(verify).toHaveBeenCalledWith('valid-token', JWT_SECRET);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o token for inválido', () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Partial<Request>;

    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(verify).toHaveBeenCalledWith('invalid-token', JWT_SECRET);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token inválido ou expirado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o token estiver ausente', () => {
    const mockReq = {
      headers: {},
    } as Partial<Request>;

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Você não está autenticado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o header authorization for inválido', () => {
    const mockReq = {
      headers: {
        authorization: 'InvalidHeader',
      },
    } as Partial<Request>;

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Você não está autenticado',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
