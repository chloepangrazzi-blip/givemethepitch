/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.60"],
  async rewrites() {
    return [
      {
        source: "/accesstheroom",
        destination: "/keyaccess",
      },
      {
        source: "/catalogue-signal",
        destination: "/catalogue?mode=panel",
      },
      {
        source: "/test-signal",
        destination: "/formtest",
      },
    ];
  },
};

export default nextConfig;
