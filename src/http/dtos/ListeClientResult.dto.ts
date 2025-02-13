import Client from '../../domain/entities/Client';

export interface ListClientResultDTO {
  clients: Client[];
  total: number;
  totalPages: number;
  message?: string;
}
