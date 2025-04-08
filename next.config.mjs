/** @type {import('next').NextConfig} */
//import './middleware/logger.js';

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  }
};

export default nextConfig;
