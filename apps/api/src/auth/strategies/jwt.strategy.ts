import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { createPublicKey } from "crypto";
import { AppConfig } from "../../config/configuration";

export interface SupabaseJwtPayload {
  aud: string | string[];
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  aal?: string;
  amr?: Array<{
    method: string;
    timestamp: number;
  }>;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  session_id?: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface SupabaseJwk {
  kty: string;
  n: string;
  e: string;
  kid: string;
  use?: string;
  alg?: string;
}

interface JwksResponse {
  keys?: SupabaseJwk[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly publicKeysByKid = new Map<string, string>();
  private readonly supabaseJwtSecret: string;
  private readonly jwksUrl: string;

  constructor(configService: ConfigService<AppConfig, true>) {
    const supabaseUrl = configService.get("supabase.url", { infer: true });
    const jwtSecret = configService.get("supabase.jwtSecret", { infer: true });

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is required to validate Supabase JWTs.");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["HS256", "ES256"],
      issuer: `${supabaseUrl.replace(/\/$/, "")}/auth/v1`,
      secretOrKeyProvider: (_request: unknown, rawJwtToken: string, done: (err: Error | null, secret?: string) => void) => {
        void this.getSecretOrPublicKey(rawJwtToken)
          .then((secretOrPublicKey) => done(null, secretOrPublicKey))
          .catch((error: Error) => done(error));
      },
    });

    this.supabaseJwtSecret = jwtSecret;
    this.jwksUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`;
  }

  validate(payload: SupabaseJwtPayload): SupabaseJwtPayload {
    if (!payload.sub) {
      throw new UnauthorizedException("JWT payload is missing a subject.");
    }

    return payload;
  }

  private async getSecretOrPublicKey(rawJwtToken: string): Promise<string> {
    const header = this.decodeHeader(rawJwtToken);

    if (header.alg === "HS256") {
      if (!this.supabaseJwtSecret) {
        throw new UnauthorizedException("SUPABASE_JWT_SECRET is required for HS256 JWT validation.");
      }

      return this.supabaseJwtSecret;
    }

    if (header.alg === "ES256") {
      if (!header.kid) {
        throw new UnauthorizedException("ES256 JWT header is missing kid.");
      }

      return this.getPublicKey(header.kid);
    }

    throw new UnauthorizedException("Unsupported JWT signing algorithm.");
  }

  private async getPublicKey(kid: string): Promise<string> {
    const cachedKey = this.publicKeysByKid.get(kid);

    if (cachedKey) {
      return cachedKey;
    }

    const response = await fetch(this.jwksUrl);

    if (!response.ok) {
      throw new UnauthorizedException("Unable to load Supabase JWKS.");
    }

    const jwks = (await response.json()) as JwksResponse;
    const jwk = jwks.keys?.find((key) => key.kid === kid);

    if (!jwk) {
      throw new UnauthorizedException("JWT signing key was not found in Supabase JWKS.");
    }

    const publicKey = createPublicKey({ key: jwk as unknown as import("crypto").JsonWebKey, format: "jwk" })
      .export({ format: "pem", type: "spki" })
      .toString();

    this.publicKeysByKid.set(kid, publicKey);

    return publicKey;
  }

  private decodeHeader(rawJwtToken: string): JwtHeader {
    const [encodedHeader] = rawJwtToken.split(".");

    if (!encodedHeader) {
      throw new UnauthorizedException("JWT header is missing.");
    }

    try {
      const normalizedHeader = encodedHeader.replace(/-/g, "+").replace(/_/g, "/");
      const paddedHeader = normalizedHeader.padEnd(
        normalizedHeader.length + ((4 - (normalizedHeader.length % 4)) % 4),
        "=",
      );

      return JSON.parse(Buffer.from(paddedHeader, "base64").toString("utf8")) as JwtHeader;
    } catch {
      throw new UnauthorizedException("JWT header is invalid.");
    }
  }
}
