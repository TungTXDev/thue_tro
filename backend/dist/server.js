const app = require("./app");
const { env } = require("./config/env");
const { connectDatabase } = require("./config/database");

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server is running at http://localhost:${env.PORT}`);
  });
};

startServer();
