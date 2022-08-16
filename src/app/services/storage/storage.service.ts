import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public storage: Storage | null = null;
  constructor(private storageObj: Storage) {
    this.init();
  }
  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storageObj.create();
    this.storage = storage;
  }

  async setItem(key: any, value: any) {
    await this.storage.set(key, value);
  }

  async getItem(key: string) {
    if (!this.storage) {
      await this.init();
    }
    return await this.storage.get(key);
  }

  async removeItem(key: string) {
    await this.storage.remove(key);
  }

  async keys() {
    const { keys } = await this.storage.keys();
    return keys;
  }

  async clear() {
    await this.storage.clear();
  }
}
