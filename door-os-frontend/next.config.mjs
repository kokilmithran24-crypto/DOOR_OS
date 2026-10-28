/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Only rewrite if an external HTTP(S) URL is configured to avoid recursive loops
    if (!apiUrl || !apiUrl.startsWith("http")) {
      return [];
    }
    const target = apiUrl.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
