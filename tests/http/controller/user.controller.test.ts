import { CreateUserService } from '../../../src/application/services/user/CreateUseService';
import { ListUserService } from '../../../src/application/services/user/ListUserService';
import { SelectUserByIdService } from '../../../src/application/services/user/SelectUserByIdService';
import { UpdateUserService } from '../../../src/application/services/user/UpdateUserService';
import { DeleteUserService } from '../../../src/application/services/user/DeleteUserService';
const UserController = require('../../../src/http/controller/UserController');

jest.mock('../../../src/application/services/user/CreateUseService');
jest.mock('../../../src/application/services/user/ListUserService');
jest.mock('../../../src/application/services/user/SelectUserByIdService');
jest.mock('../../../src/application/services/user/UpdateUserService');
jest.mock('../../../src/application/services/user/DeleteUserService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UserController - create', () => {
  it('deve criar um usuário e retornar status 201', async () => {
    const mockReq = {
      body: {
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'securePassword123',
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const userMock = { id: '123', ...mockReq.body };
    (CreateUserService.prototype.execute as jest.Mock).mockResolvedValue(
      userMock
    );

    await UserController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(userMock);
  });

  it('deve retornar status 400 em caso de erro', async () => {
    const mockReq = { body: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (CreateUserService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Invalid data')
    );

    await UserController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid data' });
  });
});

describe('UserController - index', () => {
  it('deve listar usuários e retornar status 200', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const usersMock = {
      users: [
        { id: '1', full_name: 'Vincenzo Cassano' },
        { id: '2', full_name: 'Lalisa Manobal' },
      ],
      total: 2,
      totalPages: 1,
    };
    (ListUserService.prototype.execute as jest.Mock).mockResolvedValue(
      usersMock
    );

    await UserController.index(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      meta: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
      users: usersMock.users,
    });
  });

  it('deve retornar status 400 em caso de erro', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (ListUserService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Unexpected error')
    );

    await UserController.index(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
  });
});

describe('UserController - selectById', () => {
  it('deve retornar um usuário com status 200', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const userMock = { id: '123', full_name: 'Vincenzo Cassano' };
    (SelectUserByIdService.prototype.execute as jest.Mock).mockResolvedValue(
      userMock
    );

    await UserController.selectById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(userMock);
  });

  it('deve retornar status 404 se o usuário não for encontrado', async () => {
    const mockReq = { params: { id: 'invalid-id' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (SelectUserByIdService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('User not found')
    );

    await UserController.selectById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});

describe('UserController - update', () => {
  it('deve atualizar um usuário e retornar status 200', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { full_name: 'Novo Nome', email: 'novo@email.com' },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const updatedUserMock = {
      id: '123',
      full_name: 'Novo Nome',
      email: 'novo@email.com',
    };
    (UpdateUserService.prototype.execute as jest.Mock).mockResolvedValue(
      updatedUserMock
    );

    await UserController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedUserMock);
  });

  it('deve retornar status 400 em caso de erro', async () => {
    const mockReq = { params: { id: 'invalid-id' }, body: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (UpdateUserService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Invalid data')
    );

    await UserController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid data' });
  });
});

describe('UserController - delete', () => {
  it('deve deletar um usuário e retornar status 200', async () => {
    const mockReq = { params: { id: '123' } } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (DeleteUserService.prototype.execute as jest.Mock).mockResolvedValue(true);

    await UserController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Usuário excluído com sucesso!',
    });
  });

  it('deve retornar status 400 se ocorrer um erro', async () => {
    const mockReq = { params: { id: 'invalid-id' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (DeleteUserService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('User not found')
    );

    await UserController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});
