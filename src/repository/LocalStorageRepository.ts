/**
 * localStorage数据持久化实现
 */

import type { IVariableRepository, Variable } from '../types/repository';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * localStorage存储实现
 */
export class LocalStorageRepository implements IVariableRepository {
  private readonly storageKey = STORAGE_KEYS.VARIABLES;
  private readonly syncKey = STORAGE_KEYS.SYNC_TIME;

  async getAll(): Promise<Variable[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find((v) => v.id === id) || null;
  }

  async save(variable: Variable): Promise<void> {
    const variables = await this.getAll();
    const index = variables.findIndex((v) => v.id === variable.id);

    if (index >= 0) {
      variables[index] = { ...variable, updatedAt: new Date() };
    } else {
      variables.push({ ...variable, updatedAt: new Date() });
    }

    await this.saveAll(variables);
  }

  async saveAll(variables: Variable[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(variables));
    localStorage.setItem(this.syncKey, new Date().toISOString());
  }

  async delete(id: string): Promise<void> {
    const variables = await this.getAll();
    const filtered = variables.filter((v) => v.id !== id);
    await this.saveAll(filtered);
  }

  async deleteAll(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.syncKey);
  }

  async findByName(name: string): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find((v) => v.name === name) || null;
  }

  async findByIndex(index: number): Promise<Variable | null> {
    const variables = await this.getAll();
    return variables.find((v) => v.index === index) || null;
  }

  // 批量操作实现
  async batchSave(variables: Variable[]): Promise<void> {
    await this.saveAll(variables);
  }

  async batchDelete(ids: string[]): Promise<void> {
    const allVariables = await this.getAll();
    const filtered = allVariables.filter((v) => !ids.includes(v.id));
    await this.saveAll(filtered);
  }

  // 同步操作实现
  async getLastSyncTime(): Promise<Date | null> {
    const syncTime = localStorage.getItem(this.syncKey);
    return syncTime ? new Date(syncTime) : null;
  }
}
