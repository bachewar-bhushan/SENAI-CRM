import axios from 'axios';
import { BACKEND_URL } from '../config/env';

export const getThreads = async (email) => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/threads/${email}`);
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch threads';
  }
};

export const respondToEmail = async (emailId, message) => {
  try {
    const { data } = await axios.post(`${BACKEND_URL}/threads/respond/${emailId}`, { message });
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send reply';
  }
};
