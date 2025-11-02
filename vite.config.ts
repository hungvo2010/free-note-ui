import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const reactAppKeys = [
    'REACT_APP_WS_URL',
    'REACT_APP_WS_HOST',
    'REACT_APP_WS_PORT',
    'REACT_APP_WS_PATH',
    'REACT_APP_WS_SECURE',
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
