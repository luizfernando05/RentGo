export interface UpdateCarDTO {
  plate: string | undefined;
  brand: string | undefined;
  model: string | undefined;
  km: number | undefined;
  year: number | undefined;
  price: number | undefined;
  status: string | undefined;
  items: string[] | undefined;
}
