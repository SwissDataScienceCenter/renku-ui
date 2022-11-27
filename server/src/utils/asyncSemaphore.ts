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

export class AsyncSemaphore {
  private _available: number
  private _upcoming: Function[]; // eslint-disable-line @typescript-eslint/ban-types
  private _heads: Function[]; // eslint-disable-line @typescript-eslint/ban-types

  private _completeFn!: () => void;
  private _completePr!: Promise<void>;

  constructor(public readonly workersCount: number) {
    if (workersCount <= 0) throw new Error("workersCount must be positive");
    this._available = workersCount;
    this._upcoming = [];
    this._heads = [];
    this._refreshComplete();
  }

  async withLock<A>(f: () => Promise<A>): Promise<A> {
    await this._acquire();
    return this._execWithRelease(f);
  }

  async withLockRunAndForget<A>(f: () => Promise<A>): Promise<void> {
    await this._acquire();
    this._execWithRelease(f);
  }

  async awaitTerminate(): Promise<void> {
    if (this._available < this.workersCount)
      return this._completePr;
  }

  private async _execWithRelease<A>(f: () => Promise<A>): Promise<A> {
    try {
      return await f();
    }
    finally {
      this._release();
    }
  }

  private _queue(): Function[] { // eslint-disable-line @typescript-eslint/ban-types
    if (!this._heads.length) {
      this._heads = this._upcoming.reverse();
      this._upcoming = [];
    }
    return this._heads;
  }

  private _acquire(): void | Promise<void> {
    if (this._available > 0) {
      this._available -= 1;
      return undefined;
    }
    let fn: Function = () => { /***/ } ;// eslint-disable-line @typescript-eslint/ban-types
    const p = new Promise<void>(ref => { fn = ref; });
    this._upcoming.push(fn);
    return p;
  }

  private _release(): void {
    const queue = this._queue();
    if (queue.length) {
      const fn = queue.pop();
      if (fn) fn();
    }
    else {
      this._available += 1;

      if (this._available >= this.workersCount) {
        const fn = this._completeFn;
        this._refreshComplete();
        fn();
      }
    }
  }

  private _refreshComplete(): void {
    let fn: () => void = () => { /***/ };
    this._completePr = new Promise<void>(r => { fn = r; });
    this._completeFn = fn;
  }
}
