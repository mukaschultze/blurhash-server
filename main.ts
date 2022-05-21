import Fastify from 'fastify';
import registerPlugins from './src/plugins';

const fastify = Fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
});

fastify.register(registerPlugins);

const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
