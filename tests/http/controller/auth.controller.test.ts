import { Request, Response } from 'express';
import { AuthService } from '../../../src/application/services/auth/LoginService';
const AuthController = require('../../../src/http/controller/AuthController');

jest.mock('../../../src/application/services/auth/LoginService');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = {
      body: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar token e mensagem de sucesso ao fazer login com credenciais válidas', async () => {
    const mockToken = {
      token: 'mockToken',
      message: 'Login realizado com sucesso!',
    };
    (AuthService.prototype.execute as jest.Mock).mockResolvedValue(mockToken);

    req.body = { email: 'test@example.com', password: 'password123' };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(jsonMock).toHaveBeenCalledWith(mockToken);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 quando o AuthService lança uma exceção', async () => {
    const errorMessage = 'Email ou senha inválidos.';
    (AuthService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    req.body = { email: 'test@example.com', password: 'wrongPassword' };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongPassword',
    });
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
  });

  it('deve retornar erro genérico 400 para exceções inesperadas', async () => {
    (AuthService.prototype.execute as jest.Mock).mockRejectedValue(
      'Unexpected error'
    );

    req.body = { email: 'test@example.com', password: 'password123' };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Um erro inesperado aconteceu.',
    });
  });
});
