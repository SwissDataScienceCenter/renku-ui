import { kgSearchApi } from "./KgSearchApi";
import {
  EntityType,
  KgSearchResultLink,
  KgSearchResult,
} from "../kgSearch/KgSearch.d";
import { stateToSearchString } from "./KgSearchState";

export { kgSearchApi, EntityType, stateToSearchString };
export type { KgSearchResult, KgSearchResultLink };
