import errorHandler from "errorhandler";
import { ENVIRONMENT } from "./util/env";

import { loadConfig } from "./config/storage";
import * as db from "./config/db";
import { createApp } from "./app";

async function main() {
  const config = await loadConfig();
  const app = createApp(config);

  /**
   * Error Handler. Provides full stack - remove for production
   */
  if (ENVIRONMENT !== "production") {
    app.use(errorHandler());
  }

  /**
   * Start Express server.
   */
  const server = app.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });

}
main();