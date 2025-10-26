import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, use the data proxy if it's configured
  prisma = new PrismaClient({
    ...(process.env.PRISMA_CLIENT_ENGINE_TYPE === 'dataproxy' && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL!,
        },
      },
    }),
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;