import { Client } from '../../domain/entities/Client';
import { CreateClientDTO } from './CreateClient.dto';
import { ReadClientDTO } from './ReadClient.dto';
import { ListClientParams } from '../../application/params/ListClientParams.type';
import { UpdateClientDTO } from './UpdateClient.dto';
import { DeleteClientDTO } from './DeleteClient.dto';

export interface ClientsRepositoryDTO {
  create(data: CreateClientDTO): Promise<Client | null>;

  findById(id: ReadClientDTO): Promise<Client | null>;

  index(params: ListClientParams): Promise<{clients: Client[]; total: number}>;

  update(data: UpdateClientDTO): Promise<Client | null>;

  delete(id: DeleteClientDTO): Promise<Client | null>;
}
