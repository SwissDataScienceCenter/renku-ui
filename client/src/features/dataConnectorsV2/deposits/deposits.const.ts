import { ProviderOption } from "./deposits.types";

export const POLL_TIME_INACTIVE_DEPOSITS = 60_000;
export const POLL_TIME_ACTIVE_DEPOSITS = 5_000;
export const PROVIDER_OPTIONS: ProviderOption[] = [
  { value: "zenodo", label: "Zenodo" },
];
