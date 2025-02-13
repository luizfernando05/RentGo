import { Router } from 'express';
const OrderController = require('../http/controller/OrderController');
const UserController = require('../http/controller/UserController');
const AuthController = require('../http/controller/AuthController');
const Authenticated = require('../http/middleware/Auth');
const CarController = require('../http/controller/CarController');
const ClientController = require('../http/controller/ClientController');
const routes = Router();

routes.post('/login', AuthController.create);
routes.get('/user', Authenticated, UserController.index);
routes.get('/user/:id', Authenticated, UserController.selectById);
routes.post('/user', Authenticated, UserController.create);
routes.patch('/user/:id', Authenticated, UserController.update);
routes.delete('/user/:id', Authenticated, UserController.delete);

routes.get('/car', Authenticated, CarController.list);
routes.get('/car/:id', Authenticated, CarController.show);
routes.post('/car', Authenticated, CarController.create);
routes.patch('/car/:id', Authenticated, CarController.update);
routes.delete('/car/:id', Authenticated, CarController.delete);

routes.post('/client', Authenticated, ClientController.create);
routes.get('/client/:id', Authenticated, ClientController.findById);
routes.get('/client', Authenticated, ClientController.index);
routes.patch('/client/:id', Authenticated, ClientController.update);
routes.delete('/client/:id', Authenticated, ClientController.delete);

routes.post('/order', Authenticated, OrderController.create);
routes.get('/order/:id', Authenticated, OrderController.findById);
routes.get('/order', Authenticated, OrderController.list);
routes.put('/order/:id', Authenticated, OrderController.update);
routes.delete('/order/:id', Authenticated, OrderController.delete);

export default routes;
