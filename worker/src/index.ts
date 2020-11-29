import { keys } from "./keys";
import redis from "redis";

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: parseInt(keys?.redisPort!),
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

const fib = (index: number): number => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

sub.on("message", (channel, message) => {
  redisClient.hset("values", message, String(fib(parseInt(message))));
});

sub.subscribe("insert");
