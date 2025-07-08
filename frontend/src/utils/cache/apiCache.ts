interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Enhanced methods for Employee ID system
  cacheUsers(users: any[]): void {
    this.set('users:all', users, 10 * 60 * 1000); // 10 minutes for users
    
    // Cache individual users by ID and employeeId for fast lookups
    users.forEach(user => {
      this.set(`user:id:${user.id}`, user);
      if (user.employeeId) {
        this.set(`user:empId:${user.employeeId}`, user);
      }
    });
  }

  getUserByEmployeeId(employeeId: string): any | null {
    return this.get(`user:empId:${employeeId}`);
  }

  getUserById(id: number): any | null {
    return this.get(`user:id:${id}`);
  }
}

export const apiCache = new APICache();
export default APICache;
