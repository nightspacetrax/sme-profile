import { FastifyRequest } from 'fastify';

export type ReqWithUserDto = {
  user: any;
} & FastifyRequest;
