import Keyv from 'keyv';
import { loadPackage } from '../../util';

const KeyvSqlite = await loadPackage<ObjectConstructor>('@keyv-sqlite');

/**
 * A simple cache manager.
 *
 * @typeParam T The type of the cached objects.
 */
export class CacheManager<T> {
  /**
   * Data store.
   */
  private store: Keyv<T>;

  /**
   * "Time-To-Live" - How much time (in milliseconds) before a cached object becomes stale, and thus removed automatically.
   *
   * Changing this value does not affect old objects.
   *
   * @default 7200000 // 2 hours
   */
  private ttl: number;

  /**
   * Default TTL.
   */
  private static defaultTTL = 2 * 60 * 60 * 1000; // 2h

  /**
   * Construct a new {@link CacheManager} instance.
   */
  constructor(
    /**
     * The namespace to use for this cache.
     */
    namespace: string,
    /**
     * The TTL (Time-To-Live) for objects in cache.
     *
     * @default 7200000 // 2 hours
     */
    ttl?: number
  ) {
    //sqliteAvailable ? 'sqlite://ddnet_cache.sqlite'
    this.store = new Keyv<T>({ namespace, store: KeyvSqlite ? new KeyvSqlite({ uri: 'sqlite://ddnet_cache.sqlite' }) : undefined });

    this.ttl = ttl ?? CacheManager.defaultTTL;
  }

  /**
   * Sets a key to a value in the cache.
   */
  public async set(
    /**
     * The key to set.
     */
    key: string,
    /**
     * The value to set.
     */
    value: T
  ) {
    await this.store.set(key, value, this.ttl);
  }

  /**
   * Gets the value of the given key from the cache.
   */
  public async get(
    /**
     * The key to get.
     */
    key: string
  ): Promise<T | undefined> {
    return await this.store.get(key);
  }

  /**
   * Checks if the cache has a value for the given key.
   */
  public async has(
    /**
     * The key to check.
     */
    key: string
  ): Promise<boolean> {
    return await this.store.has(key);
  }

  /**
   * Sets the {@link CacheManager.ttl}.
   */
  public setTTL(
    /**
     * If provided, sets the {@link CacheManager.ttl} to this value, otherwise uses the default value.
     */
    ttlMS?: number
  ): void {
    this.ttl = ttlMS ?? CacheManager.defaultTTL;
  }

  /**
   * Clears the {@link CacheManager.store}.
   */
  public async clearCache(): Promise<void> {
    return await this.store.clear();
  }
}
