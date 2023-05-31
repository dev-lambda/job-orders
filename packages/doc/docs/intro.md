---
sidebar_position: 1
---

# About

Job orders is an asynchronous job request API, designed to simplify and streamline the management of asynchronous tasks across multiple microservices. This API allows you to create, monitor, and control jobs in a distributed environment, providing you with greater flexibility and scalability in your operations.

With job orders, you can easily submit jobs to a queue, and our system will handle the work distribution and completion of these tasks. You can also check the status of your jobs in real-time, monitor progress, and receive notifications when tasks are completed or encounter errors.

Job orders does not support any job type out of the box, instead its role is to dispatch job requests to dedicated microservices capable of handling specific job types.

It's internal message queue or database is abstracted from both job requesters or job handlers. It exposes prometheus metrics in order to monitor the overall activity in the system as well as a dedicated API to requests job status updates.

Overall, job orders API is a powerful tool for managing complex workflows and tasks in a distributed environment. Whether you are a developer building a new microservice or a business looking to improve operational efficiency, our API is designed to simplify the management of asynchronous tasks and help you achieve your goals.

## System overview

- API server
- job orders SDK
- Worker runtime
- Monitoring dashboard

## Main concepts

### Job order

### Job worker

### Tracking job orders
