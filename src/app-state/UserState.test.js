import UserState from './UserState'
import { InitialState } from './UserState'
import { createStore } from '../utils/EnhancedState';
import { testClient as client } from '../api-client';
import { user } from '../api-client/test-samples';
import { doesNotReject } from 'assert';


describe('fetch user', () => {
  // We use a redux store to hold some global application state.
  it('starts in initial state', () => {
    const store = createStore(UserState.reducer);
    expect(store.getState()).toEqual(InitialState);
  });

  // Load the user profile and dispatch the result to the store.
  it('retrieved user form server', () => {
    const store = createStore(UserState.reducer);
    UserState.fetchAppUser(client, store.dispatch).then(() => {
      const state = store.getState();
      expect(state.id).toEqual(user.id);
      expect(state.username).toEqual(user.username);
    });
  }); 
});

describe('fake user', () => {
  const store = createStore(UserState.reducer);
  
  it('generate anonymous user', async () => {
    const generatedUser = await generateFakeUser(true);
    expect(generatedUser).toEqual(store.getState());
  });

  it('generate logged user', async () => {
    UserState.fetchAppUser(client, store.dispatch).then(async () => {
      const generatedUser = await generateFakeUser();
      expect(generatedUser).toEqual(store.getState());
    });
  });
});

/**
 * Generate a fake user to be injected in the other tests
 * 
 * @param {boolean} anonymous  True to ask for an anonymous user (no id nor username)
 * @returns {object} The user's data
 */
async function generateFakeUser(anonymous) {
  const store = createStore(UserState.reducer);
  if (anonymous) {
    return store.getState();
  }
  else {
    return UserState.fetchAppUser(client, store.dispatch).then(() => {
      return store.getState();
    });
  }
}

export { generateFakeUser }
