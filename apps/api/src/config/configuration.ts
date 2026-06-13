export interface AppConfig {
  port: number;
  appUrl: string;
  nodeEnv: string;
  supabase: {
    url: string;
    serviceKey: string;
    jwtSecret: string;
  };
  googleAi: {
    apiKey: string;
  };
  anthropic: {
    apiKey: string;
  };
  openai: {
    apiKey: string;
  };
  redis: {
    url: string;
  };
  sentry: {
    dsn: string;
  };
}

export default function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    supabase: {
      url: process.env.SUPABASE_URL ?? '',
      serviceKey: process.env.SUPABASE_SERVICE_KEY ?? '',
      jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
    },
    googleAi: { apiKey: process.env.GOOGLE_AI_API_KEY ?? '' },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY ?? '' },
    openai: { apiKey: process.env.OPENAI_API_KEY ?? '' },
    redis: { url: process.env.UPSTASH_REDIS_URL ?? 'redis://localhost:6379' },
    sentry: { dsn: process.env.SENTRY_DSN ?? '' },
  };
}
