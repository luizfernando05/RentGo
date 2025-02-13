export interface CreateOrderDTO {
  clientId: string;
  carId: string;
}

export interface OrderOutputDTO {
  status?: string;
  clientCpf?: string;
  startDate?: Date;
  endDate?: Date;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
