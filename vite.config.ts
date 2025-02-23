import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Camo ToDo App",
        short_name: "ToDo",
        description: "A Progressive ToDo Web App built with React and Vite",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache Firebase Firestore requests
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "firebase-firestore",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // Cache for 1 day
              },
            },
          },
          {
            // Cache Firebase Realtime Database requests
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "firebase-realtime-db",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400,
              },
            },
          },
          {
            // Cache static assets
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 604800, // Cache for 1 week
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist", // Ensure the build directory is set correctly
    assetsDir: "assets", // Avoid issues with asset serving
  },
  base: "/",
});
