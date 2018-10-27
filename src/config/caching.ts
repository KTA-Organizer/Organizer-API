import { cloneDeep } from "lodash";

export class CacheMap<K, V> {

  name: string;
  map: Map<K, V>;
  constructor(name: string) {
    this.name = name;
    this.map = new Map();
  }

  public async get(key: K) {
    return this.map.get(key);
  }
  public async cache(key: K, value: V) {
    value = cloneDeep(value);
    this.map.set(key, value);
  }
  public async wrap(key: K, fun: () => Promise<V>) {
    let val: V;
    if (val = await this.get(key)) {
      return val;
    }
    val = await fun();
    this.cache(key, val);
    return val;
  }
  public async changed(key: K) {
    this.map.delete(key);
  }
}