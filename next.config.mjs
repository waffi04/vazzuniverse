/** @type {import('next').NextConfig} */
const nextConfig = {
    output : 'standalone',
    reactStrictMode : true,
    eslint : {
        ignoreDuringBuilds : true
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                hostname: 'res.cloudinary.com',
            }
        ]
    }
};

export default nextConfig;
