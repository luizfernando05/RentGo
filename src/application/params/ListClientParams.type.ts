export interface ListClientParams {
  name?: string;
  email?: string;
  cpf?: string;
  isDeleted?: boolean;
  orderBy?: 'name' | 'createdAt' | 'deletedAt';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}
