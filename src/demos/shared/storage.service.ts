import { Injectable, Inject } from '@angular/core';

@Injectable()
export class StorageService {
  constructor(@Inject('Window') private window: Window) { }

  set(key: string, value: string) {
    this.window.sessionStorage.setItem(key, value);
  }
  get(key: string) {
    return this.window.sessionStorage.getItem(key);
  }
  remove(key: string) {
    return this.window.sessionStorage.removeItem(key);
  }
  setObject = function(key: string, obj: Object): Object {
    return this.set(key, JSON.stringify(obj));
  }
  getObject<T>(key: string): T {
    var result: T = null;

    var stored = this.get(key);

    if (typeof stored === 'string') {     // If there is a stored string value retrieved...
      result = <T>JSON.parse(stored);     // convert from JSON to an object.
    }
  
    return result;
  }

}