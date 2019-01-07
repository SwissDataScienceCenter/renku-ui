import UserState from  './UserState'
import { createStore } from '../utils/EnhancedState';
import { testClient as client } from '../api-client';
import { user } from '../api-client/test-samples';


describe('fetch user', () => {
  // We use a redux store to hold some global application state.
  it('starts in initial state', () => {
    const store = createStore(UserState.reducer);
    expect(store.getState()).toEqual(null);
  });

  // Load the user profile and dispatch the result to the store.
  it('retrieved user form server', () => {
    const store = createStore(UserState.reducer);
    UserState.fetchAppUser(client, store.dispatch).then(() => {
      const state = store.getState();
      expect(state.id).toEqual(user.id);
      expect(state.username).toEqual(user.username);
    })
  });
});
