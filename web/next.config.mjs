import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  }
};

export default withSentryConfig(
  nextConfig,
  {
    silent: true
  },
  {
    hideSourceMaps: true
  }
);