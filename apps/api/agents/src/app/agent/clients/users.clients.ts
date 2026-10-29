import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { instrumentRmqClient } from "@lms/filters";

export const usersClient = instrumentRmqClient(ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: process.env.USERS_QUEUE,
    queueOptions: { durable: true },
  },
}), "users");