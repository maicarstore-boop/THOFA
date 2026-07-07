/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
  },
  env: {
    NEXT_PUBLIC_ORG_NAME: process.env.NEXT_PUBLIC_ORG_NAME,
    NEXT_PUBLIC_ORG_SHORT_NAME: process.env.NEXT_PUBLIC_ORG_SHORT_NAME,
    NEXT_PUBLIC_ORG_TAGLINE: process.env.NEXT_PUBLIC_ORG_TAGLINE,
    NEXT_PUBLIC_ORG_EMAIL: process.env.NEXT_PUBLIC_ORG_EMAIL,
    NEXT_PUBLIC_ORG_PHONE1: process.env.NEXT_PUBLIC_ORG_PHONE1,
    NEXT_PUBLIC_ORG_PHONE2: process.env.NEXT_PUBLIC_ORG_PHONE2,
    NEXT_PUBLIC_ORG_ADDRESS: process.env.NEXT_PUBLIC_ORG_ADDRESS,
  },
};

module.exports = nextConfig;