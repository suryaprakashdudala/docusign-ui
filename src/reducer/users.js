import { RETRIEVE_USERS_SUCCESS } from '../actions/users';
import initialState from '../store/initialState';

const users = (state = initialState.users, action) => {
  switch (action.type) {
    case RETRIEVE_USERS_SUCCESS:
      return {
        ...state,
        list: action.users
      };

    default:
      return state;
  }
};

export default users;
