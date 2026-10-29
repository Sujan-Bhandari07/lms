import {
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { instrumentRmqClient } from "@lms/filters";

export const coursesClient = instrumentRmqClient(ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: process.env.COURSES_QUEUE,
    queueOptions: { durable: true },
  },
}), "courses");