import { ClientProxyFactory, Transport } from "@nestjs/microservices";

export const usersClient = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: process.env.USERS_QUEUE,
    queueOptions: { durable: true },
  },
});