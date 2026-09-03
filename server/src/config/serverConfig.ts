export const serverConfig = {
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  worldStateFilePath: process.env.WORLD_STATE_FILE_PATH ?? 'data/world-state.json'
};