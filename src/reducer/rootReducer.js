import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';
import login from './login';
import users from './users'

const rootReducer = combineReducers({
  routing: routerReducer,
  login,
  users,
});

export default rootReducer;