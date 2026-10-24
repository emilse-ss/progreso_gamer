import dotenv from "dotenv";

dotenv.config();

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
}

function readPort(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("La variable PORT debe ser un entero entre 1 y 65535");
  }

  return port;
}

function readCorsOrigin(): string {
  const value = process.env.CORS_ORIGIN?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Falta la variable CORS_ORIGIN requerida cuando NODE_ENV=production"
    );
  }

  return "http://localhost:5173";
}

const config = {
  mongodbUri: requiredEnvironmentVariable("MONGODB_URI"),
  mongodbDb: process.env.MONGODB_DB?.trim() || "diario_gamer",
  port: readPort(process.env.PORT),
  corsOrigin: readCorsOrigin()
};

export default config;
