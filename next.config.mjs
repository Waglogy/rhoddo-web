/** @type {import('next').NextConfig} */
const nextConfig = {
  // The web version of the app is built into public/app. Real files there are served
  // as they are, and every other /app link goes to its single page.
  async rewrites() {
    return [
      { source: '/app', destination: '/app/index.html' },
      { source: '/app/:path*', destination: '/app/index.html' },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
