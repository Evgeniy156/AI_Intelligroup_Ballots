/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // pdfjs-dist requires canvas in Node but not in browser
    config.resolve.alias.canvas = false
    return config
  },
  turbopack: {}
}

export default nextConfig
