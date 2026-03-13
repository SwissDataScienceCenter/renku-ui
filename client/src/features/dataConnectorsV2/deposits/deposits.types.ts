import { DepositProvider, DepositStatus } from "../api/data-connectors.api";

export interface CreateDepositionForm {
  name: string;
  path: string;
  provider: DepositProvider;
}
export interface EditDepositionForm {
  name: string;
  path: string;
  status: DepositStatus;
}
export type ProviderOption = { value: DepositProvider; label: string };
