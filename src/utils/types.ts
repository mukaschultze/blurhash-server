import { Static, TSchema } from '@sinclair/typebox';
import {
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteOptions,
} from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';

export type StaticFields<T> = {
  [P in keyof T]: T[P] extends TSchema ? Static<T[P]> : never;
};

export type SchemaToRoute<T extends FastifySchema> = {
  Body: StaticFields<T['body']>;
  Querystring: StaticFields<T['querystring']>;
  Params: StaticFields<T['params']>;
  Headers: StaticFields<T['headers']>;
  Response: StaticFields<T['response']>;
};

export type RouteHandler<T> = Omit<
  RouteOptions<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    T
  >,
  'url' | 'method'
>;

export type RouteModule<
  T extends {
    DeleteRoute?: RouteGenericInterface;
    GetRoute?: RouteGenericInterface;
    HeadRoute?: RouteGenericInterface;
    PatchRoute?: RouteGenericInterface;
    PostRoute?: RouteGenericInterface;
    PutRoute?: RouteGenericInterface;
    OptionsRoute?: RouteGenericInterface;
  }
> = {
  delete?: RouteHandler<T['DeleteRoute']>;
  get?: RouteHandler<T['GetRoute']>;
  head?: RouteHandler<T['HeadRoute']>;
  patch?: RouteHandler<T['PatchRoute']>;
  post?: RouteHandler<T['PostRoute']>;
  put?: RouteHandler<T['PutRoute']>;
  options?: RouteHandler<T['OptionsRoute']>;
};
