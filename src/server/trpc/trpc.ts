import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { verifyToken } from '../utils/authUtils';
import dbConnect from '../db';
import UserModel from '../db/models/User';
import { Types } from 'mongoose';
import { parse } from 'cookie';

export type ContextUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  isVerified: boolean;
  interestedCategories: Types.ObjectId[];
};

const TOKEN_COOKIE_NAME = 'token';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  await dbConnect();
  const { req, resHeaders } = opts;

  let token: string | null = null;

  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    const cookies = req.headers.get('cookie');
    if (cookies) {
      const parsedCookies = parse(cookies);
      token = parsedCookies[TOKEN_COOKIE_NAME] || null;
    }
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      const user = await UserModel.findById(decoded.userId)
        .select('-passwordHash')
        .lean<ContextUser>();
      if (user) {
        return { user, req, resHeaders };
      }
    }
  }
  return { user: null as ContextUser | null, req, resHeaders };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);