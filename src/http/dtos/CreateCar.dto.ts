export interface CreateCarDTO {
  plate: string;
  brand: string;
  model: string;
  km: number;
  year: number;
  price: number;
  status: string;
  items: string[];
}
