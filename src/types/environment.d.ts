// src/types/environment.d.ts

namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_BASEURL_API?: string;
    NODE_ENV: "development" | "production" | "test";
  }
}