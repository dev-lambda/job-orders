import express from 'express';
import jobOrders from 'src/jobOrderController/jobOrderController';
import jobOrderService from 'src/jobOrderService';
const app = express.Router();

app.use(jobOrders({ service: jobOrderService }));

export default app;
