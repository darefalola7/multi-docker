"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keys_1 = require("./keys");
const redis_1 = __importDefault(require("redis"));
const redisClient = redis_1.default.createClient({
    host: keys_1.keys.redisHost,
    port: parseInt(keys_1.keys === null || keys_1.keys === void 0 ? void 0 : keys_1.keys.redisPort),
    retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();
const fib = (index) => {
    if (index < 2)
        return 1;
    return fib(index - 1) + fib(index - 2);
};
sub.on("message", (channel, message) => {
    redisClient.hset("values", message, String(fib(parseInt(message))));
});
sub.subscribe("insert");
