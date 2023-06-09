import express from 'express';
import doc from 'src/base/apiDoc';
import jobOrders from 'src/jobOrderController/controller';
const app = express.Router();

app.use('/job', jobOrders);

// API documentation
app.use(doc);
export default app;
