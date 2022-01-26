/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

// eslint-disable-next-line no-unused-vars
export enum REDIS_PREFIX { AUTH = "AUTH_", DATA = "DATA_" }

class Storage {
  redis: Redis.Redis;
  ready = false;

  constructor(
    host: string = config.redis.host,
    port: number = config.redis.port as number,
    password: string = config.redis.password
  ) {
    // configure redis
    const redisConfig: Redis.RedisOptions = {
      host,
      port,
      lazyConnect: true,
      retryStrategy: (times) => {
        return times > 5 ?
          null :
          10000;
      },
    };
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

  async get(path: string, prefix: REDIS_PREFIX): Promise<string> {
    return await this.redis.get(`${prefix}${path}`);
  }

  async save(path: string, value: string, prefix: REDIS_PREFIX): Promise<boolean> {
    const result = await this.redis.set(`${prefix}${path}`, value);
    if (result === "OK")
      return true;
    // istanbul ignore next
    return false;
  }

  async lpush(path: string, value: string, prefix: REDIS_PREFIX): Promise<boolean> {
    const result = await this.redis.lpush(`${prefix}${path}`, value);
    if (typeof result == "number")
      return true;
    // istanbul ignore next
    return false;
  }

  async ltrim(path: string, length: number, prefix: REDIS_PREFIX): Promise<boolean> {
    const result = await this.redis.ltrim(`${prefix}${path}`, 0, length - 1);
    if (result == "OK")
      return true;
    // istanbul ignore next
    return false;
  }

  async lrange(path: string, start: number, stop: number, prefix: REDIS_PREFIX): Promise<string[]> {
    return await this.redis.lrange(`${prefix}${path}`, start, stop);
  }

  async delete(path: string, prefix: REDIS_PREFIX): Promise<number> {
    return this.redis.del(`${prefix}${path}`);
  }

  shutdown(): void {
    this.redis.disconnect();
  }
}


export { Storage };
