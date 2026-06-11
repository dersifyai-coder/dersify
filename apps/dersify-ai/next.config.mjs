/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  // Monorepo root — keeps Next from picking up stray lockfiles outside the repo.
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
