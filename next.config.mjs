/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Prevents ESLint from running in production
    },
    experimental: {
        turbo: true, // Tries to speed up the build
    },
    output: "standalone", // Optimizes Next.js for deployment
};

export default nextConfig;
