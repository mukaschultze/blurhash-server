import { Static, Type } from '@sinclair/typebox';
import * as blurhash from 'blurhash';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { Resource } from 'fastify-autoroutes';
import Jimp from 'jimp';

const paramsSchema = Type.Object({
  img: Type.String({ format: 'uri' }),
});

const querySchema = Type.Object({
  componentX: Type.Number({ minimum: 1, maximum: 9, default: 4 }),
  componentY: Type.Number({ minimum: 1, maximum: 9, default: 4 }),
});

const responseSchema = {
  200: Type.String(),
};

type GetRequest = FastifyRequest<{
  Params: Static<typeof paramsSchema>;
  Querystring: Static<typeof querySchema>;
  Reply: Static<typeof responseSchema['200']>;
}>;

export default (fastify: FastifyInstance) =>
  <Resource>{
    get: {
      schema: {
        params: paramsSchema,
        querystring: querySchema,
        response: responseSchema,
      },
      handler: async (request: GetRequest, reply) => {
        const imgUrl = request.params.img;
        const img = await Jimp.read(imgUrl);
        const bitmap = img.bitmap;
        const { componentX, componentY } = request.query;

        const result = blurhash.encode(
          new Uint8ClampedArray(bitmap.data),
          bitmap.width,
          bitmap.height,
          componentX,
          componentY
        );

        reply.etag(img.hash(16));
        return result;
      },
    },
  };
1;
