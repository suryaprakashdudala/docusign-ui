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


export const registerUser = (user) => async (dispatch) => {
  try {
    await api.post("/users/registerUser", user, { headers: { "Content-Type": "application/json" } })
    message.success('User created successful')
    dispatch(getAllUsers());
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Fail to create user';
    message.error(errorMsg);
    throw error;
  }
}

export const updateUser = (id, user) => async (dispatch) => {
    try {
      await api.put(`/users/${id}`, user, { headers: { "Content-Type": "application/json" } })
      message.success('User updated successful')
      dispatch(getAllUsers());
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fail to update user';
      message.error(errorMsg);
      throw error;
    }
  }