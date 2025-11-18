/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dukaan.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dms.mydukaan.io",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
