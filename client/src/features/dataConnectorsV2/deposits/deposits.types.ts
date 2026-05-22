import { DepositProvider, DepositStatus } from "../api/data-connectors.api";

type DepositProviders = DepositProvider | "envidat";

export interface CreateDepositionForm {
  name: string;
  path: string;
  provider: DepositProviders;
}
export interface EditDepositionForm {
  name: string;
  path: string;
  status: DepositStatus;
}
export type ProviderOption = {
  value: DepositProviders;
  label: string;
  integration?: string;
};
