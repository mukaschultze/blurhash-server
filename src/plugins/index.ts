import gracefulExit from '@mgcrea/fastify-graceful-exit';
import autoroutes from 'fastify-autoroutes';
import favicon from 'fastify-favicon';
import fp from 'fastify-plugin';
import sensible from 'fastify-sensible';
import swagger from 'fastify-swagger';
import underPressure from 'under-pressure';
import caching, { Privacy } from './caching';

const registerPlugins = fp(async (fastify, options) => {
  fastify.register(underPressure, {
    maxEventLoopDelay: 1000,
    message: 'Under pressure!',
    retryAfter: 50,
  });

  fastify.register(swagger, {
    routePrefix: '/docs',
    exposeRoute: true,
    mode: 'dynamic',
  });

  fastify.register(autoroutes, {
    dir: './src/routes', // relative to your cwd
  });

  fastify.register(caching, {
    privacy: Privacy.PUBLIC,
    serverExpiresIn: 36000,
    expiresIn: 36000,
  });

  fastify.register(favicon);

  fastify.register(gracefulExit);
  fastify.register(sensible);
});

export default registerPlugins;
