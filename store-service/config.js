"use strict";

module.exports = {
    PORT: process.env.PORT || 3000,
    APP: {
        API_KEY: process.env.API_KEY || "0bed97a8f4d7c2675672af22e8642d2fcbd6",
        TTL_SECONDS: process.env.TTL_SECONDS || 10,
        SWAGGER_PATH: process.env.SWAGGER_PATH || "/swagger/stores"
    },
    MONGODB: {
        HOST: process.env.MONGODB_HOST || "",
        PORT: process.env.MONGODB_PORT || 27017,
        NAME: process.env.MONGODB_NAME || "",
        USERNAME: process.env.MONGODB_USERNAME || "",
        PASSWORD: process.env.MONGODB_PASSWORD || ""
    },
    REDIS: {
        HOST: process.env.REDIS_HOST || "localhost",
        PORT: process.env.REDIS_PORT || "6379",
        PASSWORD: process.env.REDIS_PASSWORD || "55b674512072",
        DB: process.env.REDIS_DB || 0,
    }
}
