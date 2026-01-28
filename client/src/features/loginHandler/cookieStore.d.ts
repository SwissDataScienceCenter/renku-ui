// Types for the modern cookie store interface.
// See: https://developer.mozilla.org/en-US/docs/Web/API/CookieStore
//
// NOTE: we can probably get these types from typescript when we
// upgrade to the current release.

interface Window {
  readonly cookieStore: CookieStore;
}

interface CookieStore extends EventTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onchange: ((this: CookieStore, ev: CookieChangeEvent) => any) | null;
  delete(name: string): Promise<void>;
  delete(options: CookieStoreDeleteOptions): Promise<void>;
  get(name: string): Promise<CookieListItem | null>;
  get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>;
  getAll(name: string): Promise<CookieList>;
  getAll(options?: CookieStoreGetOptions): Promise<CookieList>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieInit): Promise<void>;
  addEventListener<K extends keyof CookieStoreEventMap>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: CookieStore, ev: CookieStoreEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof CookieStoreEventMap>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: CookieStore, ev: CookieStoreEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

// eslint-disable-next-line no-var
declare var CookieStore: {
  prototype: CookieStore;
  new (): CookieStore;
};
