import {
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

export const coursesClient = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: process.env.COURSES_QUEUE,
    queueOptions: { durable: true },
  },
});