import { ListUserParams } from '../../params/ListUserParams.type';
import { AppDataSource } from '../../../infra/data-source';
import User from '../../../domain/entities/User';

class ListUserService {
  async execute(params: ListUserParams) {
    const userRepository = AppDataSource.getRepository(User);
    const queryBuilder = userRepository.createQueryBuilder('user');
    // .withDeleted();

    if (params.name) {
      queryBuilder
        .andWhere('user.full_name LIKE :name', {
          name: `%${params.name}%`,
        })
        .withDeleted();
    }

    if (params.email) {
      queryBuilder
        .andWhere('user.email LIKE :email', {
          email: `%${params.email}%`,
        })
        .withDeleted();
    }

    if (params.isDeleted) {
      queryBuilder.andWhere('user.deletedAt IS NOT NULL').withDeleted();
    } else if (params.isDeleted === false) {
      queryBuilder.andWhere('user.deletedAt IS NULL');
    }

    if (params.orderBy) {
      const orderFields = Array.isArray(params.orderBy)
        ? params.orderBy
        : [params.orderBy];
      const orderDirection = params.orderDirection || 'ASC';

      orderFields.forEach((field) => {
        queryBuilder.addOrderBy(`user.${field}`, orderDirection).withDeleted();
      });
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [users, total] = await queryBuilder.getManyAndCount();

    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      users: sanitizedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export { ListUserService };
