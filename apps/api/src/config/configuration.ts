export interface AppConfig {
  port: number;
  appUrl: string;
  supabase: {
    url: string;
    serviceKey: string;
  };
  anthropic: {
    apiKey: string;
  };
  jwt: {
    secret: string;
  };
}

export default function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    appUrl: process.env.APP_URL ?? "http://localhost:3000",
    supabase: {
      url: process.env.SUPABASE_URL ?? "",
      serviceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? "",
    },
  };
}
