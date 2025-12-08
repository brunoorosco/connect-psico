import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  // ESSENCIAL para o App Router funcionar com PWA
  experimental: {
    appDir: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
