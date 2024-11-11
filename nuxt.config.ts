// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";
export default defineNuxtConfig({
  devtools: { enabled: true },

  alias: {
    "@": resolve(__dirname, "/"),
  },

  css: ["~/assets/css/main.scss"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: ["@nuxtjs/i18n"],

  i18n: {
    locales: [
      { code: "en", iso: "en-US", name: "English", files: ["en/nian.json"] },
      { code: "sv", iso: "sv-SE", name: "Svenska", files: ["sv/nian.json"] },
    ],
    lazy: true,
    langDir: "locales",
    defaultLocale: "en",
    strategy: "no_prefix",
    vueI18n: "i18n.config.ts",
  },

  experimental: {
    scanPageMeta: true,
  },

  compatibilityDate: "2024-11-11",
});