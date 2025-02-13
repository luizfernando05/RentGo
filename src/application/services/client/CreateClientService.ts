import { CreateClientDTO } from '../../../http/dtos/CreateClient.dto';
import { Client } from '../../../domain/entities/Client';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';

class CreateClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute(data: CreateClientDTO): Promise<Client | null> {
    const client = await this.clientsRepository.create(data);
    return client;
  }
}

export default CreateClientService;
