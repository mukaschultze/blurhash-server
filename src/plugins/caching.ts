import cacheManager from 'cache-manager';
import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { FastifyReply } from 'fastify/types/reply';
import uidSafe from 'uid-safe';

declare module 'fastify' {
  interface FastifyReply {
    _etagLife?: number;
    etag: typeof etag;
    expires: typeof cachingExpires;
  }

  interface FastifyInstance {
    cache: NonNullable<CachingOptions['cache']>;
    etagMaxLife: CachingOptions['etagMaxLife'];
  }
}

export interface CachingOptions {
  expiresIn?: number;
  serverExpiresIn?: number;
  privacy?: Privacy;
  cache?: cacheManager.Cache;
  etagMaxLife?: number;
}

const defaultOptions: CachingOptions = {
  etagMaxLife: 3600000,
};

function cachingExpires(this: FastifyReply, date: Date | string) {
  if (!date) return this;
  this.header('Expires', date instanceof Date ? date.toUTCString() : date);
  return this;
}

function etag(this: FastifyReply, value?: string, lifetime?: number) {
  this.header('ETag', value || uidSafe.sync(18));
  this._etagLife = Number.isInteger(lifetime) ? lifetime : 3600000;
  return this;
}

async function etagHandleRequest(
  this: FastifyInstance,
  req: FastifyRequest,
  res: FastifyReply
) {
  if (!req.headers['if-none-match']) return;

  const etag = req.headers['if-none-match'];
  const cached = await this.cache.get(etag);

  if (cached) {
    return res.status(304).send();
  }
}

async function etagOnSend(
  this: FastifyInstance,
  req: FastifyRequest,
  res: FastifyReply,
  payload: unknown
) {
  const etag = res.getHeader('etag');
  if (!etag || !res._etagLife) return;
  await this.cache.set(etag, true, res._etagLife);
  return payload;
}

async function fastifyCachingPlugin(
  instance: FastifyInstance,
  options: CachingOptions
) {
  const _options = Object.assign({}, defaultOptions, options);

  if (!_options.cache)
    _options.cache = cacheManager.caching({
      store: 'memory',
      max: 10000,
      ttl: options.etagMaxLife! /*seconds*/,
    });

  if (_options.privacy) {
    // https://tools.ietf.org/html/rfc2616#section-14.9.4
    let value = _options.privacy?.toString();
    if (_options.privacy.toLowerCase() !== 'no-cache' && _options.expiresIn) {
      value = `${_options.privacy}, max-age=${_options.expiresIn}`;
    }

    if (
      _options.privacy !== undefined &&
      _options.privacy.toLowerCase() === 'public' &&
      _options.serverExpiresIn
    ) {
      value += `, s-maxage=${_options.serverExpiresIn}`;
    }

    instance.addHook('onRequest', async (req, res) => {
      res.header('Cache-control', value);
    });
  }

  instance.decorate('cache', _options.cache);
  instance.decorate('etagMaxLife', _options.etagMaxLife);
  instance.decorateReply('etag', etag);
  instance.decorateReply('expires', cachingExpires);
  instance.addHook('onRequest', etagHandleRequest);
  instance.addHook('onSend', etagOnSend);

  //   instance[Symbol.for('fastify-caching.registered')] = true
}

export default fp(fastifyCachingPlugin, {
  fastify: '^3.0.0',
  name: 'fastify-caching',
});

export enum Privacy {
  NOCACHE = 'no-cache',
  PUBLIC = 'public',
  PRIVATE = 'private',
}
