import express from 'express';
import doc from './base/apiDoc';

const app = express.Router();

// TODO: set application router here

// API documentation
app.use(doc);

export default app;
