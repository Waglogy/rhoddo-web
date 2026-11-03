/** @type {import('next').NextConfig} */
const nextConfig = {
  // The web version of the app is built into public/app. Real files there are served
  // as they are, and every other /app link goes to its single page. Build folders are
  // left out, so a missing font or script is a clear 404 rather than an HTML page.
  async rewrites() {
    return [
      { source: '/app', destination: '/app/index.html' },
      { source: '/app/:path((?!_expo/|assets/|backdrop/).*)', destination: '/app/index.html' },
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
