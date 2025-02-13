import { UpdateClientDTO } from '../../../http/dtos/UpdateClient.dto';
import { Client } from '../../../domain/entities/Client';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';

class UpdateClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute(data: UpdateClientDTO): Promise<Client | null> {
    const client = await this.clientsRepository.update(data);
    return client;
  }
}

export default UpdateClientService;
