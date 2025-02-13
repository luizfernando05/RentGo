import ClientsRepository from '../../../domain/repositories/ClientsRepository';
import { ListClientResultDTO } from '../../../http/dtos/ListeClientResult.dto';
import { ListClientParams } from '../../params/ListClientParams.type';

class ListClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute(params: ListClientParams): Promise<ListClientResultDTO> {
    const { clients, total } = await this.clientsRepository.index(params);
    const pageSize = params.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize);

    if (clients.length === 0) {
      return { message: 'No clients found', clients: [], total, totalPages };
    }

    return { clients, total, totalPages };
  }
}

export default ListClientService;
