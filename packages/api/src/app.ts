import express from 'express';
import jobOrders from 'src/jobOrderController/controller';

const app = express.Router();

app.use(jobOrders());

export default app;
