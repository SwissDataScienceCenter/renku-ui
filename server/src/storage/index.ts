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

  async get(path: string): Promise<string> {
    return await this.redis.get(path);
  }

  async save(path: string, value: string): Promise<boolean> {
    const result = await this.redis.set(path, value);
    if (result === "OK")
      return true;
    // istanbul ignore next
    return false;
  }

  async delete(path: string): Promise<number> {
    const result = this.redis.del(path);
    return result;
  }

  shutdown(): void {
    this.redis.disconnect();
  }
}


export { Storage };
