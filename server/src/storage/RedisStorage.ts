/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Redis from "ioredis";
import config from "../config";
import logger from "../logger";
import { SaveCollectionOptions, StorageSaveOptions, Storage, TypeData, StorageGetOptions } from "./index";

class RedisStorage implements Storage {
  private redis: Redis.Redis;
  ready = false;

  constructor(
    host: string = config.redis.host,
    port: number = config.redis.port as number,
    password: string = config.redis.password,
    isSentinel: boolean = config.redis.isSentinel as boolean,
    masterSet: string = config.redis.masterSet,
  ) {
    // configure redis
    const redisConfig: Redis.RedisOptions = {
      lazyConnect: true,
      retryStrategy: (times) => {
        return times > 5 ?
          null :
          10000;
      },
    };
    if (isSentinel) {
      redisConfig.sentinels = [
        { host, port },
      ];
      redisConfig.name = masterSet;
      if (password)
        redisConfig.sentinelPassword = password;
    }
    else {
      redisConfig.host = host;
      redisConfig.port = port;
    }
    if (password)
      redisConfig.password = password;
    try {
      this.redis = new Redis(redisConfig);
      this.redis.connect(() => {
        if (this.redis.status === "ready")
          this.ready = true;
      });
    }
    catch (error) /* istanbul ignore next */ {
      const newError = new Error(`Cannot connect to Redis -- ${error.message}`);
      newError.stack = newError.stack.split("\n").slice(0, 2).join("\n") + "\n" + error.stack;
      logger.error(newError);
    }
  }

  getStatus() : string {
    return this.redis.status;
  }

  shutdown(): void {
    this.redis.disconnect();
  }

  async get(path: string, options: StorageGetOptions = { type: TypeData.String } ): Promise<string|string[]> {
    switch (options.type) {
      case TypeData.String: {
        return await this.redis.get(path);
      }
      case TypeData.Collections: {
        if (options.start === undefined || options.stop === undefined)
          return [];
        return await this.getCollection(path, options.start, options.stop);
      }
      default:
        return null;
    }
  }

  async save(path: string, value: string, options: StorageSaveOptions = { type: TypeData.String }): Promise<boolean> {
    switch (options.type) {
      case TypeData.String: {
        const result = await this.saveString(path, value);
        return result === "OK";
      }
      case TypeData.Collections: {
        if (!options.limit || !options.score)
          return false;
        const saveCollectionOptions: SaveCollectionOptions = {
          limit: options.limit,
          score: options.score
        };

        return await this.saveCollection(path, value, saveCollectionOptions);
      }
      default:
        return false;
    }
  }

  async delete(path: string): Promise<number> {
    return this.redis.del(path);
  }

  private async saveString(path: string, value: string): Promise<string> {
    return await this.redis.set(path, value);
  }

  private async saveCollection(path: string, value: string, options: SaveCollectionOptions): Promise<boolean> {
    await this.redis.zadd(path, options.score, value);
    return true;
  }

  private async getCollection(path: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.zrevrange(path, start, stop);
  }
}

export { RedisStorage };
