import { Request, Response } from 'express';
import CarsRepository from '../../domain/repositories/CarsRepository';
import CreateCarService from '../../application/services/Car/CreateCarService';
import ShowCarService from '../../application/services/Car/ShowCarService';
import ListCarService from '../../application/services/Car/ListCarService';
import UpdateCarService from '../../application/services/Car/UpdateCarService';
import DeleteCarService from '../../application/services/Car/DeleteCarService';
import { ListCarParams } from '../../application/params/ListCarsParams.type';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { AppDataSource } from '../../infra/data-source';

class CarController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { plate, brand, model, km, year, price, status, items } = req.body;

      const carsRepository = new CarsRepository();

      const createCar = new CreateCarService(carsRepository);

      const car = await createCar.execute({
        plate, brand, model, km, year, price, status, items
      });

      return res.status(201).json({ id: car.id });
    }
    catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });

      return res.status(500).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const carsRepository = new CarsRepository();

      const showCar = new ShowCarService(carsRepository);

      const car = await showCar.execute(id);

      return res.json(car);
    }
    catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });

      return res.status(500).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const {
        page,
        limit,
        status,
        endPlate,
        brand,
        model,
        km,
        fromYear,
        untilYear,
        minPrice,
        maxPrice,
        orderBy,
        orderDirection,
      }: ListCarParams = req.query;

      let { items } = req.query;
      const filtered_items: string[] = (typeof items === 'string') ? [items] : items as string[];

      const carsRepository = new CarsRepository();

      const listCar = new ListCarService(carsRepository);

      const cars = await listCar.execute({
        page,
        limit,
        status,
        endPlate,
        brand,
        model,
        items: filtered_items,
        km,
        fromYear,
        untilYear,
        minPrice,
        maxPrice,
        orderBy,
        orderDirection,
      });

      if (cars.data.length === 0)
        return res.sendStatus(204);

      return res.json(cars);
    }
    catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });

      return res.status(500).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { plate, brand, model, km, year, price, status, items } = req.body;

      const carsRepository = new CarsRepository();

      const updateCar = new UpdateCarService(carsRepository);

      await updateCar.execute(id, { plate, brand, model, km, year, price, status, items });

      return res.sendStatus(204);
    }
    catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });

      return res.status(500).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const carsRepository = new CarsRepository();
      const orderRepository = new OrderRepository(AppDataSource);

      const deleteCar = new DeleteCarService(carsRepository, orderRepository);

      await deleteCar.execute(id);

      return res.sendStatus(204);
    }
    catch (err) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });

      return res.status(500).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }
}

module.exports = new CarController();
