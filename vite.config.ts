/**
 * @fileoverview Vite Build Configuration for Hydrogen Storefront
 *
 * @description
 * Configures Vite for building the Shopify Hydrogen storefront with:
 * - React Compiler for automatic memoization
 * - Tailwind CSS v4 for styling
 * - Hydrogen and Oxygen plugins for Shopify integration
 * - React Router for file-based routing
 *
 * @architecture
 * Build Pipeline:
 * 1. Babel (React Compiler) - Optimizes React components
 * 2. Tailwind CSS - Processes CSS
 * 3. Hydrogen - Shopify storefront features
 * 4. Oxygen - Cloudflare Workers deployment
 * 5. React Router - Route handling and SSR
 * 6. TSConfig Paths - Path alias resolution (~/)
 *
 * @performance
 * React Compiler automatically optimizes:
 * - Component re-renders
 * - Function reference stability
 * - Expensive computations
 * - Works without manual optimization
 *
 * @dependencies
 * - vite - Build tool
 * - @shopify/hydrogen/vite - Storefront API integration
 * - @shopify/mini-oxygen/vite - Local Workers environment
 * - @react-router/dev/vite - File-based routing
 * - @tailwindcss/vite - CSS processing
 * - vite-plugin-babel - React Compiler via Babel
 *
 * @related
 * - react-router.config.ts - Router configuration
 * - tailwind.css - Tailwind theme configuration
 * - tsconfig.json - TypeScript path aliases
 */

import {defineConfig} from "vite";
import {hydrogen} from "@shopify/hydrogen/vite";
import {oxygen} from "@shopify/mini-oxygen/vite";
import {reactRouter} from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import babel from "vite-plugin-babel";

// =============================================================================
// REACT COMPILER CONFIGURATION
// =============================================================================

/**
 * React Compiler configuration for React 18 compatibility.
 * The target must be explicitly set to "18" for React 18.x projects.
 */
const ReactCompilerConfig = {
    target: "18"
};

// =============================================================================
// VITE CONFIGURATION
// =============================================================================

export default defineConfig({
    plugins: [
        // -------------------------------------------------------------------------
        // PLUGINS
        // Order matters: Babel must run first to transform JSX/TSX with React Compiler
        // -------------------------------------------------------------------------
        babel({
            filter: /\.[jt]sx?$/,
            babelConfig: {
                presets: [["@babel/preset-react", {runtime: "automatic"}], "@babel/preset-typescript"],
                plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]]
            }
        }), // React Compiler via Babel - automatic memoization
        tailwindcss(), // Tailwind CSS v4 processing
        hydrogen(), // Shopify Hydrogen features (cart, storefront client)
        oxygen(), // Shopify Oxygen (Cloudflare Workers) environment
        reactRouter(), // React Router 7 file-based routing
        tsconfigPaths() // Enables ~/ path alias from tsconfig.json
    ],

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
                "react-compiler-runtime",
                "use-sync-external-store/shim",
                "@radix-ui/react-use-is-hydrated"
            ]
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
