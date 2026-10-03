import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Read inside the constructor, not at module scope: the env file is loaded
    // by ConfigModule during bootstrap, and a module-level read can capture
    // an undefined DATABASE_URL. On Aiven the string must carry
    // ?sslmode=require since the service only accepts TLS.
    const connectionString = process.env.DATABASE_URL as string;

    super({
      adapter: new PrismaPg({
        connectionString,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 15_000,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}