import { FileStore } from "./fileStore.js";
import { PostgresStore } from "./postgresStore.js";

export async function createStore({
  dataDir,
  uploadsDir,
  keyframesDir,
  exportsDir,
  databaseUrl,
  databaseSslEnabled,
  databaseSslRejectUnauthorized,
}) {
  if (databaseUrl) {
    const postgres = new PostgresStore({
      databaseUrl,
      sslEnabled: databaseSslEnabled,
      sslRejectUnauthorized: databaseSslRejectUnauthorized,
    });
    await postgres.init();
    return postgres;
  }

  const fileStore = new FileStore({ dataDir, uploadsDir, keyframesDir, exportsDir });
  await fileStore.init();
  return fileStore;
}
