/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Prevents ESLint from running in production
    },
    output: "standalone", // Optimizes Next.js for deployment
};

export default nextConfig;
