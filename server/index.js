"use strict";
// Houses all logic of the app
//Handles connect to redis, postgres, and running react application
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keys_1 = require("./keys");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const redis_1 = __importDefault(require("redis"));
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
console.log(__dirname);
//Postgres client setup
const pgClient = new pg_1.Pool({
    user: keys_1.keys.pgUser,
    host: keys_1.keys.pgHost,
    database: keys_1.keys.pgDatabase,
    password: keys_1.keys.pgPassword,
    port: parseInt(keys_1.keys === null || keys_1.keys === void 0 ? void 0 : keys_1.keys.pgPort),
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
const redisClient = redis_1.default.createClient({
    host: keys_1.keys.redisHost,
    port: parseInt(keys_1.keys === null || keys_1.keys === void 0 ? void 0 : keys_1.keys.redisPort),
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();
//Express route handlers
app.get("/", (req, res, next) => {
    res.send("Hi");
});
app.get("/values/all", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = yield pgClient.query("SELECT * from values");
    res.send(values.rows);
}));
app.get("/values/current", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
}));
app.post("/values", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send("Index too high!");
    }
    redisClient.hset("values", index, "Nothing yet!");
    redisPublisher.publish("insert", index);
    yield pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
    res.send({ working: true });
}));
const server = app.listen(5000, () => {
    console.log("Listening");
});
//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err}`);
    //Close server and exit process
    server.close();
    server.close(() => process.exit(1));
});
