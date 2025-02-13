export interface ListUserParams {
  name?: string;
  email?: string;
  isDeleted?: boolean;
  orderBy?: 'full_name' | 'createdAt' | 'deletedAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}
