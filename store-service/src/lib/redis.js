"use strict";

const Redis = require("redis");

module.exports = class Redis_Instance {
    constructor(config) {
        if (!config || config === {} ) {
            return new Error("Config for Redis was missing, or invalid");
        }

        this.config = config;

        let options = {
            url: `redis://:${this.config.PASSWORD}@${this.config.HOST}:${this.config.PORT}/${this.config.DB}`,
            retry_stategy: (opts) => {
                if (opts) {
                    console.error(`Redis error: ${opts}`);
                }
                if (opts.error && opts.error.code === "ECONNREFUSED") {
                    console.error("The server refused the connection");
                    return new Error("The server refused the connection");
                }
                if (opts.total_retry_time > 5000) {
                    console.error("Retry time exhausted!");
                    return new Error("Retry time exhausted!");
                }
                if (opts.attempt > 10) {
                    console.error("Connect retry attempt is greater than 10");
                    return undefined;
                }
        
                console.log(`Redis re-connected after ${Math.min(opts.attempt*100, 3000)}`);
                return Math.min(opts.attempt*100, 3000);
            }, 
            socket_keepalive: true
        };

        let redis_instance = Redis.createClient(options);
        redis_instance.on("ready", () => {
            console.log(`Connected to Redis server redis://${this.config.HOST}:${this.config.PORT}/${this.config.DB}`);
        });

        redis_instance.on("warning", (warn_message) => {
            console.log(warn_message);
        });

        redis_instance.on("error", (err) => {
            console.error("error", err);

            if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === "production") {
                process.exit(1);
            }
        });

        this.redis = redis_instance;

        return this;
    }

    cache(key, value) {
        return new Promise ((resolve, reject) => {     
            if (!key || key.length === 0 ||
                !value || value === {}) {
                reject(new Error("both key and value are required"));
                return;
            }

            key = key.toString();
            value = JSON.stringify(value);

            if (this.redis.connected) {
                this.redis.set(key, value, "EX", this.config.DEFAULT_TIMEOUT_SECONDS, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(null);
                    return;
                });
            } else {
                resolve(null);
                return;
            }
        });
    }

    lookup(key) {
        return new Promise ((resolve, reject) => {
            if (!key || key.length === 0) {
                reject(new Error("key is required"));
                return;
            }

            let data = {
                key: key.toString(),
                value: "",
                ttl: -1
            };

            if (this.redis.connected) {
                Promise.all([
                    new Promise(((resolve, reject) => {
                        this.redis.get(data.key, (e, reply) => {
                            if (e) {
                                reject(e);
                                return; 
                            }
                            
                            resolve(reply);
                            return;
                        })
                    })),
                    new Promise((resolve, reject) => {
                        this.redis.ttl(key, (e, n) => {
                            if (e) {
                                reject(e);
                                return; 
                            }
                            
                            resolve(n);
                            return;
                        })
                    })
                ]).then((results) => {
                    data.value = results[0] || "";
                    data.ttl = results[1] || -1;

                    resolve(data);
                    return;
                }).catch((errors) => {
                    if (errors) {
                        console.error(errors);

                        resolve(data);
                        return;                        
                    }
                });
            } else {
                resolve(data);
                return;
            }
        });
    }
}
