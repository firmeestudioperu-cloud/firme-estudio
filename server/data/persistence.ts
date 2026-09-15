import fs from 'fs';
import path from 'path';

export interface StoreSnapshot {
  classes: any[];
  bookings: any[];
  clients: any[];
  transactions: any[];
  expenses: any[];
  leads: any[];
  cashRegister: any;
  whatsappLogs: any[];
  savedAt: string;
  version: string;
}

class StorePersistence {
  private dataDir: string;
  private filePath: string;
  private backupPath: string;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isSaving = false;
  private hasPendingSave = false;
  private latestPendingSnapshot: Omit<StoreSnapshot, 'savedAt' | 'version'> | null = null;
  private lastSavedAt: string | null = null;

  constructor() {
    this.dataDir = path.join(process.cwd(), '.data');
    this.filePath = path.join(this.dataDir, 'studio-store.json');
    this.backupPath = path.join(this.dataDir, 'studio-store.json.bak');
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err: any) {
      console.warn('[Persistence] Warning: Could not create .data directory:', err.message);
    }
  }

  /**
   * Returns telemetry metrics for health checks
   */
  getTelemetry() {
    return {
      lastSavedAt: this.lastSavedAt,
      isSaving: this.isSaving,
      hasPendingSave: this.hasPendingSave,
    };
  }

  /**
   * Loads persisted state from disk if available, with fallback to .bak
   */
  loadState(): StoreSnapshot | null {
    const tryFile = (target: string): StoreSnapshot | null => {
      if (!fs.existsSync(target)) return null;
      try {
        const raw = fs.readFileSync(target, 'utf-8');
        const parsed = JSON.parse(raw) as StoreSnapshot;
        if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.bookings)) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[Persistence] Warning: Failed parsing ${target}:`, err.message);
      }
      return null;
    };

    const mainState = tryFile(this.filePath);
    if (mainState) {
      this.lastSavedAt = mainState.savedAt || null;
      console.log(`[Persistence] Loaded state snapshot from ${mainState.savedAt || 'disk'}`);
      return mainState;
    }

    const backupState = tryFile(this.backupPath);
    if (backupState) {
      this.lastSavedAt = backupState.savedAt || null;
      console.warn(`[Persistence] Recovered state snapshot from backup (.bak) ${backupState.savedAt || 'disk'}`);
      return backupState;
    }

    return null;
  }

  /**
   * Schedules a debounced disk save (300ms) with dirty-state queueing
   */
  scheduleSave(snapshot: Omit<StoreSnapshot, 'savedAt' | 'version'>): void {
    this.latestPendingSnapshot = snapshot;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushAsync();
    }, 300);

    if (this.debounceTimer.unref) {
      this.debounceTimer.unref();
    }
  }

  /**
   * Non-blocking asynchronous flush with queue draining
   */
  private async flushAsync(): Promise<void> {
    if (!this.latestPendingSnapshot) return;

    if (this.isSaving) {
      this.hasPendingSave = true;
      return;
    }

    this.isSaving = true;
    const currentSnapshot = this.latestPendingSnapshot;
    this.latestPendingSnapshot = null;
    this.hasPendingSave = false;

    try {
      this.ensureDirectory();
      const nowIso = new Date().toISOString();
      const payload: StoreSnapshot = {
        ...currentSnapshot,
        savedAt: nowIso,
        version: '1.1.0',
      };

      const tempPath = `${this.filePath}.tmp`;
      const isProd = process.env.NODE_ENV === 'production';
      const jsonContent = isProd
        ? JSON.stringify(payload)
        : JSON.stringify(payload, null, 2);

      await fs.promises.writeFile(tempPath, jsonContent, 'utf-8');

      if (fs.existsSync(this.filePath)) {
        try {
          await fs.promises.copyFile(this.filePath, this.backupPath);
        } catch {
          // ignore backup copy failure
        }
      }

      await fs.promises.rename(tempPath, this.filePath);
      this.lastSavedAt = nowIso;
    } catch (err: any) {
      console.error('[Persistence] Error writing async snapshot to disk:', err.message);
    } finally {
      this.isSaving = false;
      if (this.hasPendingSave && this.latestPendingSnapshot) {
        this.flushAsync();
      }
    }
  }

  /**
   * Writes the snapshot immediately and synchronously (used on server shutdown)
   */
  saveImmediate(snapshot: Omit<StoreSnapshot, 'savedAt' | 'version'>): boolean {
    try {
      this.ensureDirectory();
      const nowIso = new Date().toISOString();
      const payload: StoreSnapshot = {
        ...snapshot,
        savedAt: nowIso,
        version: '1.1.0',
      };

      const tempPath = `${this.filePath}.tmp`;
      const jsonContent = JSON.stringify(payload, null, 2);
      fs.writeFileSync(tempPath, jsonContent, 'utf-8');

      if (fs.existsSync(this.filePath)) {
        try {
          fs.copyFileSync(this.filePath, this.backupPath);
        } catch {
          // ignore
        }
      }

      fs.renameSync(tempPath, this.filePath);
      this.lastSavedAt = nowIso;
      return true;
    } catch (err: any) {
      console.error('[Persistence] Error writing immediate snapshot to disk:', err.message);
      return false;
    }
  }
}

export const persistence = new StorePersistence();
