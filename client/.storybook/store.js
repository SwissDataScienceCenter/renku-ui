import {createStoreWithEnhancers} from "../src/utils/helpers/EnhancedState.js";
import { enhancer as withReduxEnhancer } from 'addon-redux'

const store = createStoreWithEnhancers({}, [withReduxEnhancer]);

export default store
