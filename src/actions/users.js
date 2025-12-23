import { message } from 'antd';
import createActionType from '../utils/action';
import api from '../api/api';

export const RETRIEVE_USERS_SUCCESS = createActionType('RETRIEVE_USERS_SUCCESS');

export const getAllUsers = () => async (dispatch) => {
  try {
    const res = await api.get("/users");
    dispatch({ type: RETRIEVE_USERS_SUCCESS, users: res.data });
  } catch (error) {
    console.error("Failed to fetch users", error);
    message.error("Failed to load users");
    return [];
  }
};