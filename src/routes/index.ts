import { FastifyInstance } from 'fastify';
import { Resource } from 'fastify-autoroutes';

export default (fastifyInstance: FastifyInstance) =>
  <Resource>{
    get: {
      handler: async (request, reply) => 'Hello, Route',
    },
  };
