import { MemoryJobQueuer } from 'src/queuer/MemoryJobQueuer';
import { MemoryJobOrderRepository } from 'src/repository/MemoryJobOrderRepository';
import { JobOrderService } from './JobOrderService';
import { StdOutEmitterService } from 'src/eventEmitter/StdOutEmitterService';
import { GenericPayload, JobEvents } from '@dev-lambda/job-orders-dto';

const queuer = new MemoryJobQueuer();
const emitter = new StdOutEmitterService<JobEvents, GenericPayload>();
const repository = new MemoryJobOrderRepository();
const service = new JobOrderService(repository, queuer, emitter);

export default service;
