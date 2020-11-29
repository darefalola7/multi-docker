// Houses all logic of the app
//Handles connect to redis, postgres, and running react application

import { keys } from "./keys";
import express, { NextFunction, Response, Request } from "express";
import cors from "cors";
import { Pool } from "pg";
import redis from "redis";

const app = express();
app.use(cors());
app.use(express.json());

console.log(__dirname);

//Postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: parseInt(keys?.pgPort!),
});

pgClient.on("error", () => console.log("Lost PG Connection!"));

pgClient.on("connect", () => {
  console.log("Connect successful!");
  pgClient
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.log(err))
    .then((result) => {
      console.log("DB Table created!");
    });
});

//Redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: parseInt(keys?.redisPort!),
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

//Express route handlers
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hi");
});

app.get(
  "/values/all",
  async (req: Request, res: Response, next: NextFunction) => {
    const values = await pgClient.query("SELECT * from values");

    res.send(values.rows);
  }
);

app.get(
  "/values/current",
  async (req: Request, res: Response, next: NextFunction) => {
    redisClient.hgetall("values", (err, values) => {
      res.send(values);
    });
  }
);

app.post("/values", async (req: Request, res: Response, next: NextFunction) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high!");
  }

  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  await pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

const server = app.listen(5000, () => {
  console.log("Listening");
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise) => {
  console.log(`Error: ${err}`);

  //Close server and exit process
  server.close();

  server.close(() => process.exit(1));
});
