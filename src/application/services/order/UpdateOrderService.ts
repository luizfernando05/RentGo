import { Order } from '../../../domain/entities/Order';
import CarsRepository from '../../../domain/repositories/CarsRepository';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { UpdateOrderDTO } from '../../../http/dtos/UpdateOrder.dto';

const fetch = require('node-fetch');

interface ViaCepResponse {
  cep: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export class UpdateOrderService {
  private orderRepository: OrderRepository;
  private carRepository: CarsRepository;

  constructor(orderRepository: OrderRepository, carRepository: CarsRepository) {
    this.orderRepository = orderRepository;
    this.carRepository = carRepository;
  }

  public async updateOrder({
    orderId,
    initialDate,
    finalDate,
    cep,
    status,
  }: UpdateOrderDTO): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Validate initial date only if provided
    if (initialDate) {
      if (initialDate < new Date()) {
        throw new Error(
          'A Data Hora Inicial não pode ser menor que a data/hora atual.'
        );
      }
      order.initialDate = initialDate;
    }

    // end Date Time Validation
    const effectiveFinalDate = finalDate ?? order.finalDate;
    if (
      effectiveFinalDate &&
      order.initialDate &&
      effectiveFinalDate < order.initialDate
    ) {
      throw new Error(
        'A Data Hora Final não pode ser menor que a Data Hora Inicial.'
      );
    }
    if (finalDate) {
      order.finalDate = finalDate;
    }

    // CEP validation and update
    if (cep) {
      const addressData = await this.fetchCepData(cep);
      if (!addressData) {
        throw new Error('CEP não encontrado');
      }
      if (
        !['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'].includes(
          addressData.uf
        )
      ) {
        throw new Error('No momento não temos filiais nessa região');
      }
      order.cep = cep;
      order.city = addressData.localidade;
      order.state = addressData.uf;
    }

    // status update
    if (status) {
      if (status === 'Aprovado') {
        if (order.status !== 'Aberto' || !this.isOrderComplete(order)) {
          throw new Error(
            'O pedido precisa estar "Aberto" e todos os campos devem estar preenchidos para ser aprovado.'
          );
        }
        order.status = 'Aprovado';
        order.finalDate = new Date();
      } else if (status === 'Cancelado') {
        if (order.status !== 'Aberto') {
          throw new Error('Apenas pedidos "Aberto" podem ser cancelados.');
        }
        order.status = 'Cancelado';
        order.cancellationDate = new Date();

        const car = await this.carRepository.findById(order.car.id);
        if (car) {
          car.status = 'ativo';
          await this.carRepository.save(car);
        }
      }
    }

    return await this.orderRepository.createOrder(order);
  }

  private async fetchCepData(cep: string): Promise<ViaCepResponse | null> {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) return null;

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro) return null;

    return data;
  }

  private isOrderComplete(order: Order): boolean {
    return !!(
      order.initialDate &&
      order.cep &&
      order.city &&
      order.state &&
      order.totalValue
    );
  }
}
