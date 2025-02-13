export interface UpdateOrderDTO {
  orderId: string;
  initialDate?: Date;
  finalDate?: Date;
  cep?: string;
  status?: 'Aprovado' | 'Cancelado';
}
