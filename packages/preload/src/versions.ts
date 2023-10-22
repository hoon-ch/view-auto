export { versions } from "node:process";
import { env } from "node:process";

export const packageVersion = env.npm_package_version;
