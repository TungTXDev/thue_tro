"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const startServer = async () => {
    // Connect to Database
    await (0, database_1.connectDatabase)();
    // Start Express server
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${env_1.env.PORT}`);
    });
};
startServer();
