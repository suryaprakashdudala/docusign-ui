import { USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGIN_FAILURE, USER_LOGOUT } from '../actions/login';
import initialState from '../store/initialState';


const login = (state = initialState.auth, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        loading: true
      };

    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.user,
        isAuthenticated: true
      };

    case USER_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false
      };

    case USER_LOGOUT:
      return initialState.auth;

    default:
      return state;
  }
};

export default login;