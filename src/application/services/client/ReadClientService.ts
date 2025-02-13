import { Client } from '../../../domain/entities/Client';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';

class ReadClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute(id: string): Promise<Client | null> {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      return null;
    }
    return client;
  }
}

export default ReadClientService;
