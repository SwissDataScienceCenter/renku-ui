import { ProviderOption } from "./deposits.types";

export const POLL_TIME_INACTIVE_DEPOSITS = 60_000;
export const POLL_TIME_ACTIVE_DEPOSITS = 5_000;
export const PROVIDER_OPTIONS: ProviderOption[] = [
  { value: "zenodo", label: "Zenodo" },
];
export const LAST_DEPOSIT_QUERY_PARAMS = { page: 1, per_page: 1 }; // We only consider the last deposit for now
