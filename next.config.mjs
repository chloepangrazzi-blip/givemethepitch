/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.60"],
  outputFileTracingExcludes: {
    "/*": [
      "./public/Teaser_MOBILE.mp4",
      "./public/Teaser_site.mp4",
      "./public/audio/maree-noire-dossier.m4a",
      "./public/audio/maree-noire-dossier.m4b",
      "./public/audio/maree-noire-fragment-*.mp4",
    ],
  },
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
