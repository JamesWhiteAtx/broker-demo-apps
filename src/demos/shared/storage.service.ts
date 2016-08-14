import { Injectable, Inject } from '@angular/core';

const MULTI_STORE_KEY = 'demo_multi_store';

class KeyHash {
  [key: string]: Object;
}

@Injectable()
export class StorageService {
  constructor(@Inject('Window') private window: Window) { }

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

  private getMulti(): KeyHash {
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

  private setObject(key: string, obj: Object): void {
    this.window.sessionStorage.setItem(key, JSON.stringify(obj));
  }

  private getObject<T>(key: string): T {
    let result: T = null;

    let stored = this.window.sessionStorage.getItem(key);

    if (typeof stored === 'string') {     // If there is a stored string value retrieved...
      result = <T>JSON.parse(stored);     // convert from JSON to an object.
    }
  
    return result;
  }

}