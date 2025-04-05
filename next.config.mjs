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
            },
            {
                hostname: 'upload.wikimedia.org',
            }
        ]
    }
};

export default nextConfig;
