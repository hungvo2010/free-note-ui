import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const reactAppKeys = [
    'VITE_WS_URL',
    'VITE_WS_HOST',
    'VITE_WS_PORT',
    'VITE_WS_PATH',
    'VITE_WS_SECURE',
  ] as const

  const define: Record<string, string> = {}
  for (const key of reactAppKeys) {
    define[`import.meta.env.${key}`] = JSON.stringify(env[key])
  }

  return {
    plugins: [tsconfigPaths()],
    define,
  }
})
