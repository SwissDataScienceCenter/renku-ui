import { createStore } from "../src/utils/helpers/EnhancedState";
import { enhancer as withReduxEnhancer } from "addon-redux";

const store = createStore({}, [withReduxEnhancer]);

export default store;
