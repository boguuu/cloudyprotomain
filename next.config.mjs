/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 도메인 허용
  experimental: {
    allowedDevOrigins: ["dev.cloudify.lol:3000"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google 프로필 이미지용
      },
    ],
  },
};

export default nextConfig;
