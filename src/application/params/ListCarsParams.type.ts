export interface ListCarParams {
  page?: number;
  limit?: number;
  status?: 'ativo' | 'inativo';
  endPlate?: string;
  brand?: string;
  model?: string;
  items?: string[];
  km?: number;
  fromYear?: number;
  untilYear?: number;
  minPrice?: number;
  maxPrice?: number;
  orderBy?: 'price' | 'year' | 'km';
  orderDirection?: 'ASC' | 'DESC';
}
