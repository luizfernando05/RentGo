import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import Client from '../../domain/entities/Client';

export class ClientSeeder implements Seeder {
  track?: boolean | undefined;

  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const clientRepository = dataSource.getRepository(Client);

    const clientData = {
      name: 'Jack Daniels',
      birthday: '1846-09-05',
      cpf: '12345678900',
      email: 'jackdaniels@exemplo.com',
      phone: '(11) 12345-6789',
    };

    const clientExists = await clientRepository.findOneBy({
      email: clientData.email,
    });

    if (!clientExists) {
      const newClient = clientRepository.create(clientData);
      await clientRepository.save(newClient);
    }
  }
}
