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
    domains : [
        'vazzuniverse.id'
    ],    minimumCacheTTL: 60,

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
