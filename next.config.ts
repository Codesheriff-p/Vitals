import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mongoose (and the underlying MongoDB driver) rely on dynamic requires and
  // optional native bindings that bundlers can't statically analyze — keep it
  // as a real node_modules require instead of bundling it.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
