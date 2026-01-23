export interface PaginatedState<T = unknown> {
  data: T[] | undefined;
  fetchedPages: number;
  hasMore: boolean;
  currentRequestId: string;
}
