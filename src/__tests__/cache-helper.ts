import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface CacheEntry {
  response: string;
  timestamp: number;
}

export class TestCache {
  private cacheDir: string;
  private cacheExpiry: number; // cache expiry in milliseconds

  constructor(cacheDir: string = '.test-cache', expiryHours: number = 24) {
    this.cacheDir = path.join(process.cwd(), cacheDir);
    this.cacheExpiry = expiryHours * 60 * 60 * 1000;
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheKey(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private getCachePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  get(content: string): string | null {
    const cacheKey = this.getCacheKey(content);
    const cachePath = this.getCachePath(cacheKey);

    if (fs.existsSync(cachePath)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CacheEntry;
        
        // Check if cache has expired
        if (Date.now() - cacheData.timestamp < this.cacheExpiry) {
          return cacheData.response;
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }
    return null;
  }

  set(content: string, response: string): void {
    const cacheKey = this.getCacheKey(content);
    const cachePath = this.getCachePath(cacheKey);
    
    const cacheEntry: CacheEntry = {
      response,
      timestamp: Date.now()
    };

    try {
      fs.writeFileSync(cachePath, JSON.stringify(cacheEntry, null, 2));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
} 