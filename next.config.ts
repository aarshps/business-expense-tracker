import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// Read the version from package.json
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
