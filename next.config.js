const withCSS = require("@zeit/next-css");
const withOffline = require("next-offline");
const { withPlugins } = require("next-compose-plugins");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const BASE_URL = "https://api.github.com/";

const nextConfig = {
  workboxOpts: {
    clientsClaim: true,
    skipWaiting: true,
    swDest: path.join(__dirname, "public/service-worker.js"),

    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "OfflineCache",
          expiration: {
            maxEntries: 200
          }
        }
      },
      {
        urlPattern: new RegExp(`^${BASE_URL}`),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-cache",
          cacheableResponse: {
            statuses: [0, 200],
            headers: {
              "x-test": "true"
            }
          }
        }
      },
      {
        urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
        handler: "CacheFirst"
      },
      {
        urlPattern: /(results | question)/,
        handler: "NetworkFirst",
        options: {
          cacheableResponse: {
            statuses: [0, 200],
            headers: {
              "x-test": "true"
            }
          }
        }
      }
    ]
  },

  webpack(config, { isServer }) {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: "empty"
    };

    if (!isServer) {
      config.module.rules
        .find(({ test }) => test.test("style.css"))
        .use.push({
          loader: "css-purify-webpack-loader",
          options: {
            includes: ["./pages/*.js", "./components/*.js"]
          }
        });
    }

    const PUBLIC_PATH = "..";

    config.plugins.push(
      new WebpackPwaManifest({
        filename: "static/manifest.json",
        name: "Runa | GitHub in list",
        short_name: "GitHub in list",
        description: "App to find GitHub's repositories and users to make a list.",
        background_color: "#FFF",
        theme_color: "#8378f4",
        display: "standalone",
        orientation: "portrait",
        fingerprints: false,
        inject: false,
        start_url: "/",
        ios: {
          "apple-mobile-web-app-title": "GitHub the List",
          "apple-mobile-web-app-status-bar-style": "#8378f4"
        },
        icons: [
          {
            src: path.resolve("public/assets/logo.png"),
            sizes: [36, 48, 72, 96, 144, 192, 512],
            destination: "/static"
          },
          {
            src: path.resolve("public/assets/logo.png"),
            sizes: [120, 152, 167, 180, 1024],
            destination: "/static",
            ios: true
          },
          {
            src: path.resolve("public/assets/logo.png"),
            size: 1024,
            destination: "/static",
            ios: "startup"
          }
        ],
        includeDirectory: true,
        publicPath: PUBLIC_PATH
      })
    );
    return config;
  }
};

module.exports = withPlugins([[withCSS], [withOffline]], nextConfig);
