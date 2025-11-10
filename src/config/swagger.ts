import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const PORT = process.env.PORT || 3000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flashcards API",
      version: "1.0.0",
      description:
        "Flashcard öğrenme uygulaması için backend API dokümantasyonu",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token httpOnly cookie olarak gönderilir",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // route dosyalarındaki açıklamaları alır
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📘 Swagger Docs available at http://localhost:${PORT}/api-docs`);
};
