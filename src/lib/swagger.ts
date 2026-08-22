import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '@/config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'GlobeTrotter API',
      version: '0.1.0',
      description:
        'Backend API for GlobeTrotter — a personalized, collaborative travel-planning platform. ' +
        'This is a hackathon skeleton: contracts are stable, business rules will keep expanding.',
    },
    servers: [{ url: env.API_PREFIX, description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'TRIP_NOT_FOUND' },
                message: { type: 'string', example: 'Trip not found' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
