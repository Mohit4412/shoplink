import type { NextConfig } from 'next';
import path from 'path';

const supabaseHost = (() => {
  const configuredUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) {
    return null;
  }

  try {
    return new URL(configuredUrl).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      ...(supabaseHost
        ? [{
            protocol: 'https' as const,
            hostname: supabaseHost,
          }]
        : []),
    ],
  },
};

export default nextConfig;
