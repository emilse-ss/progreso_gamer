import app from "./app";
import { closeDB, connectDB } from "./config/conexionDB";
import config from "./config/env";

async function startServer(): Promise<void> {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Servidor iniciado en el puerto ${config.port}`);
  });

  const shutdown = (): void => {
    server.close((error) => {
      if (error) {
        console.error("Error al cerrar el servidor HTTP", error);
        process.exitCode = 1;
        return;
      }

      void closeDB().catch((closeError: unknown) => {
        console.error("Error al cerrar la conexión a la base de datos", closeError);
        process.exitCode = 1;
      });
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

void startServer().catch((error: unknown) => {
  console.error("No se pudo iniciar el servidor", error);
  process.exitCode = 1;
});
