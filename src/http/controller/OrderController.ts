import { Request, Response } from 'express';
import { CreateOrderService } from '../../application/services/order/CreateOrderService';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import ClientsRepository from '../../domain/repositories/ClientsRepository';
import { CarsRepository } from '../../domain/repositories/CarsRepository';
import { AppDataSource } from '../../infra/data-source';
import { FindOrderService } from '../../application/services/order/FindOrderService';
import { ListOrderService } from '../../application/services/order/ListOrdersService';
import { UpdateOrderService } from '../../application/services/order/UpdateOrderService';
import { DeleteOrderService } from '../../application/services/order/DeleteOrderService';

class OrderController {
  private createOrderService: CreateOrderService;
  private findOrderService: FindOrderService;
  private listOrderService: ListOrderService;
  private updateOrderService: UpdateOrderService;
  private deleteOrderService: DeleteOrderService;

  constructor() {
    const orderRepository = new OrderRepository(AppDataSource);
    const clientRepository = new ClientsRepository();
    const carRepository = new CarsRepository();
    this.createOrderService = new CreateOrderService(
      orderRepository,
      clientRepository,
      carRepository
    );
    this.findOrderService = new FindOrderService(orderRepository);
    this.listOrderService = new ListOrderService(orderRepository);
    this.updateOrderService = new UpdateOrderService(
      orderRepository,
      carRepository
    );
    this.deleteOrderService = new DeleteOrderService(
      orderRepository,
      carRepository
    );
  }

  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { clientId, carId } = req.body;

    if (!clientId)
      return res.status(400).json({ error: 'O campo clientId é obrigatório.' });

    if (!carId)
      return res.status(400).json({ error: 'O campo carId é obrigatório.' });

    try {
      const order = await this.createOrderService.execute({ clientId, carId });
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public findById = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;

    try {
      const order = await this.findOrderService.findOrderById(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public list = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { status, clientCpf, startDate, endDate, sortOrder, page, limit } =
      req.query;

    try {
      const orders = await this.listOrderService.listOrders({
        status: status as string,
        clientCpf: clientCpf as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      return res.status(200).json(orders);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;
    const { initialDate, finalDate, cep, status } = req.body;

    // cep input validation
    let formattedCep = cep;
    if (cep) {
      const cepRegex = /^\d{5}-\d{3}$/;
      if (cepRegex.test(cep)) {
        formattedCep = cep.replace('-', '');
      } else if (!/^\d{8}$/.test(cep)) {
        return res.status(400).json({
          error: 'O campo CEP deve estar no formato 00000-000 ou 00000000.',
        });
      }
    }

    // status validation
    let formattedStatus = status;
    if (status) {
      formattedStatus =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      const validStatuses = ['Aprovado', 'Cancelado'];
      if (!validStatuses.includes(formattedStatus)) {
        return res.status(400).json({
          error: `O campo status deve ser um dos seguintes valores: ${validStatuses.join(', ')}.`,
        });
      }
    }

    try {
      const order = await this.updateOrderService.updateOrder({
        orderId: id,
        initialDate: initialDate ? new Date(initialDate) : undefined,
        finalDate: finalDate ? new Date(finalDate) : undefined,
        cep: formattedCep,
        status: formattedStatus as 'Aprovado' | 'Cancelado',
      });

      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public delete = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;

    try {
      const order = await this.deleteOrderService.softDeleteOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      return res.status(200).json({ message: 'Pedido deleteado com sucesso.' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };
}

module.exports = new OrderController();
