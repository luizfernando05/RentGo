import { Request, Response } from 'express';
import CreateClientService from '../../application/services/client/CreateClientService';
import { v4 as uuidv4 } from 'uuid';
import ReadClientService from '../../application/services/client/ReadClientService';
import ListClientService from '../../application/services/client/ListClientService';
import { ListClientParams } from '../../application/params/ListClientParams.type';
import UpdateClientService from '../../application/services/client/UpdateClientService';
import DeleteClientService from '../../application/services/client/DeleteClientService';
import { isValidCPF } from '../../infra/config/cpfValidator';
import { emailRegex } from '../../infra/config/regex';

class ClientController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const createClientService = new CreateClientService();
      const { name, birthday, cpf, email, phone } = req.body;
      const id = uuidv4();
      const clientData = { id, name, birthday, cpf, email, phone };

      if (cpf && !isValidCPF(cpf)) {
        return res.status(400).json({ message: 'Invalid cpf' });
      }

      if (email && !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      const client = await createClientService.execute(clientData);
      if (!client) {
        return res.status(400).json({
          message:
            'Client creation failed: invalid data or conflicts detected.',
        });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const readClientService = new ReadClientService();
      const { id } = req.params;
      console.log(req.params);
      const client = await readClientService.execute(id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async index(req: Request, res: Response): Promise<Response> {
    try {
      const listClientService = new ListClientService();
      const params = req.query as ListClientParams;

      const result = await listClientService.execute(params);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const updateClientService = new UpdateClientService();
      const { id } = req.params;
      const { name, birthday, cpf, email, phone } = req.body;

      const clientData = { id, name, birthday, cpf, email, phone };

      if (cpf) {
        if (!isValidCPF(cpf)) {
          return res.status(400).json({ message: 'Invalid cpf' });
        }
      }

      if (email) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: 'Invalid email' });
        }
      }

      const client = await updateClientService.execute(clientData);

      if (!client) {
        return res
          .status(404)
          .json({ message: 'Client not found or is already deleted' });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deleteClientService = new DeleteClientService();
      const { id } = req.params;

      const client = await deleteClientService.execute(id);

      if (!client) {
        return res
          .status(404)
          .json({ message: 'Client not found or is already deleted' });
      }

      return res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = new ClientController();
