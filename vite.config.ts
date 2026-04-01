import {defineConfig} from "vite";
import {hydrogen} from "@shopify/hydrogen/vite";
import {oxygen} from "@shopify/mini-oxygen/vite";
import {reactRouter} from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss(), hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],

    // -------------------------------------------------------------------------
    // BUILD OPTIONS
    // -------------------------------------------------------------------------
    build: {
        // Don't inline assets as base64 - this allows strict CSP headers
        // All assets are served as separate files with proper caching
        assetsInlineLimit: 0
    },

    // -------------------------------------------------------------------------
    // SSR OPTIONS
    // -------------------------------------------------------------------------
    ssr: {
        optimizeDeps: {
            /**
             * Include dependencies here if they throw CJS<>ESM errors.
             * For example, for the following error:
             *
             * > ReferenceError: module is not defined
             * >   at /Users/.../node_modules/example-dep/index.js:1:1
             *
             * Include 'example-dep' in the array below.
             * @see https://vitejs.dev/config/dep-optimization-options
             */
            include: [
                "set-cookie-parser",
                "cookie",
                "react-router",
                "use-sync-external-store/shim",
                "@radix-ui/react-use-is-hydrated"
            ],
            exclude: ["@shopify/hydrogen"]
        }
    },
    // -------------------------------------------------------------------------
    // DEV SERVER OPTIONS
    // -------------------------------------------------------------------------
    server: {
        // Allowed hosts for development server
        // - tryhydrogen.dev: Shopify's development environment
        // - ngrok: Required for Customer Account API OAuth flow
        allowedHosts: [".tryhydrogen.dev", "hermelinda-nonsegmentary-hettie.ngrok-free.dev"]
    }
});
