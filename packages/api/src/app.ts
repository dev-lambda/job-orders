import express from 'express';
import jobOrders from 'src/jobOrderController/controller';
import doc from './doc/controller';
const app = express.Router();

app.use('/job', jobOrders);

// API documentation
app.use(doc);
export default app;
