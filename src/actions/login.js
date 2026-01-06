import { message } from 'antd';
import createActionType from '../utils/action';
import api from '../api/api';
import { toasterMessages } from '../constants/constants';
import { getAllUsers } from './users';
import { persistor } from '../store/configureStore';
 
const { LOGIN_SUCCESS, LOGIN_FAILURE } = toasterMessages;

export const USER_LOGIN_REQUEST = createActionType('USER_LOGIN_REQUEST');
export const USER_LOGIN_SUCCESS = createActionType('USER_LOGIN_SUCCESS');
export const USER_LOGIN_FAILURE = createActionType('USER_LOGIN_FAILURE');
export const USER_LOGOUT = createActionType('USER_LOGOUT');

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const response = await api.post("auth/login", {
      userName: credentials.username,
      password: credentials.password,
    }, {
      headers: { "Content-Type": "application/json" }
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    message.success(LOGIN_SUCCESS);
    dispatch({ type: USER_LOGIN_SUCCESS, user});
    dispatch(getAllUsers());
    return user;
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAILURE});
    message.error(LOGIN_FAILURE);
    console.log('Login failed: ' + (error.response?.data || error.message));
    
  }
}

export const logout = () => (dispatch) => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    persistor.purge();
    dispatch({ type: USER_LOGOUT });
};

export const forgotPassword = (userName) => async () => {
  try {
    await api.post(
      "auth/forgotpassword", { userName }, { headers: { "Content-Type": "application/json" } }
    );
    message.success('Forgot password request sent!');
  } catch (error) {
    console.log(error);
    message.error('Forgot password failed');
  }
};

export const verifyOtp = (userName, otp) => async () => {
  try {
    await api.post(
      "auth/verifyotp", { userName, otp }, { headers: { "Content-Type": "application/json" } }
    );
    message.success('OTP verified successfully!');
  } catch (error) {
    message.error('OTP verification failed: ' + (error.response?.data || 'Unknown error'));
  }
};

export const resetPassword = (userName, password) => async () => {
  try {
    await api.post("auth/resetpassword",  { userName, password }, { headers: { "Content-Type": "application/json" } })
    message.success('Password reset successful')
  } catch (error) {
    message.error('Fail to reset password')
  }
}

export const updatePassword = (userName, password) => async () => {
  try {
    await api.post("auth/updatepassword",  { userName, password }, { headers: { "Content-Type": "application/json" } })
    message.success('Password updates successful')
  } catch (error) {
    message.error('Fail to update password')
  }
}