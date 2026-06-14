// Re-export the proxy logic as Next.js middleware.
// The actual implementation lives in src/proxy.ts to keep this file minimal.
export { proxy as middleware, config } from "@/proxy";
