interface Window {
  readonly cookieStore: CookieStore;
}

interface CookieStore extends EventTarget {
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
    listener: (this: CookieStore, ev: CookieStoreEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare var CookieStore: {
  prototype: CookieStore;
  new (): CookieStore;
};
