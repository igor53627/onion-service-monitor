import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'docs/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    // Configure vitest to find dependencies in the .claude-collective subdirectory
    deps: {
      external: ['fs-extra']
    }
  }
})