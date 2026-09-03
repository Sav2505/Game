import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PersistedWorldState } from '../../../shared/types';

export class WorldStateRepository {
  public constructor(private readonly filePath: string) {}

  public async load(): Promise<PersistedWorldState | null> {
    try {
      const raw = await readFile(this.resolveFilePath(), 'utf8');
      const parsed = JSON.parse(raw) as PersistedWorldState;
      if (!Array.isArray(parsed.worldPickups)) {
        return null;
      }

      return {
        version: parsed.version ?? 1,
        updatedAt: parsed.updatedAt ?? Date.now(),
        worldPickups: parsed.worldPickups.map((pickup) => ({ ...pickup }))
      };
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'ENOENT') {
        return null;
      }

      console.warn('[multiplayer] Failed to load world state file.', error);
      return null;
    }
  }

  public async save(state: PersistedWorldState): Promise<void> {
    const absolutePath = this.resolveFilePath();
    const directory = path.dirname(absolutePath);
    const tempPath = `${absolutePath}.tmp`;

    await mkdir(directory, { recursive: true });
    await writeFile(tempPath, JSON.stringify(state, null, 2), 'utf8');
    await rename(tempPath, absolutePath);
  }

  public async clear(): Promise<void> {
    await rm(this.resolveFilePath(), { force: true });
  }

  private resolveFilePath(): string {
    return path.resolve(process.cwd(), this.filePath);
  }
}