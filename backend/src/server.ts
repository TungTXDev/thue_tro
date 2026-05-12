import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

const startServer = async () => {
  // Connect to Database
  await connectDatabase();

  // Start Express server
  app.listen(env.PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${env.PORT}`);
  });
};

startServer();
