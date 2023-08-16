import { createStore } from "../src/utils/helpers/EnhancedState.ts";
import { enhancer as withReduxEnhancer } from "addon-redux";

const store = createStore({}, [withReduxEnhancer]);

export default store;
