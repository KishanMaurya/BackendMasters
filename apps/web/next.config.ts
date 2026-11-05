import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Next refuses to optimize images from local addresses. Local Supabase is one, and only that.
const isLocalSupabase = supabaseUrl
  ? /^(localhost|127\.0\.0\.1)$/.test(new URL(supabaseUrl).hostname)
  : false;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Image uploads pass through a Server Action: 5 MB, plus room for multipart overhead.
    serverActions: { bodySizeLimit: '6mb' },
  },
  images: {
    // Article covers are served from Supabase Storage.
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ];
  },
  async redirects() {
    // The admin addresses named in the original brief.
    return [
      { source: '/admin/categories', destination: '/admin/taxonomy', permanent: false },
      { source: '/admin/tags', destination: '/admin/taxonomy', permanent: false },
      { source: '/admin/articles/:id/edit', destination: '/admin/articles/:id', permanent: false },
    ];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
