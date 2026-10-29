import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    projects: [
      'apps/web/vitest.config.mts',
      {
        resolve: {
          alias: {
            '@lms/shared': resolve(import.meta.dirname, 'libs/shared/src/index.ts'),
            '@lms/redis': resolve(import.meta.dirname, 'libs/redis/src/index.ts'),
            '@lms/db': resolve(import.meta.dirname, 'libs/db/src/index.ts'),
            '@lms/filters': resolve(import.meta.dirname, 'libs/filters/src/index.ts'),
          },
        },
        test: {
          name: 'api',
          include: ['apps/api/**/*.spec.ts'],
          environment: 'node',
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
