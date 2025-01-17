export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isServer = import.meta.env.SSR;
export const env = import.meta.env;
export const isClient = !isServer;
