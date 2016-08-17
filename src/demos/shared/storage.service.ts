import { Injectable, Inject } from '@angular/core';

const MULTI_STORE_KEY = 'demo_multi_store';

export class KeyHash {
  [key: string]: Object;
}

@Injectable()
export class StorageService {
  private storage: Storage;

  constructor(@Inject('Window') private window: Window) {
    this.storage = window.localStorage || window.sessionStorage;
  }

  set(key: string, obj: Object) {
    this.setMultiVal(key, obj);
  }
  get<T extends Object>(key: string): T {
    let multi = this.getMulti();
    return <T>multi[key];
  }
  remove(key: string) {
    this.clearMultiVal(key);
  }

  getMulti(): KeyHash {
    return this.getObject<KeyHash>(MULTI_STORE_KEY) || new KeyHash();
  }

  private setMultiVal(key: string, obj: Object): void {
    let multi = this.getMulti();
    multi[key] = obj;
    this.setObject(MULTI_STORE_KEY, multi);
  }

  private clearMultiVal(key: string): void {
    let multi = this.getMulti();
    delete multi[key];
    this.setObject(MULTI_STORE_KEY, multi);
  }

  setObject(key: string, obj: Object): void {
    this.storage.setItem(key, JSON.stringify(obj));
  }

  getObject<T>(key: string): T {
    let result: T = null;

    let stored = this.storage.getItem(key);

    if (typeof stored === 'string') {     // If there is a stored string value retrieved...
      result = <T>JSON.parse(stored);     // convert from JSON to an object.
    }
  
    return result;
  }

}