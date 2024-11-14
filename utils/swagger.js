// utils/swagger.js
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Q&A API Documentation",
      version: "1.0.0",
      description:
        "API documentation for managing questions, answers, and voting",
    },
    servers: [
      {
        url: "http://localhost:4001", // แก้เป็น URL ของคุณ
      },
    ],
  },
  apis: ["./routes/*.mjs"], // ใส่ path ของไฟล์ router
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
