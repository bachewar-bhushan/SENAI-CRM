import axios from 'axios';
import { BACKEND_URL } from '../config/env';

export const getContact = async (email) => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/contacts/${email}`);
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch contact';
  }
};

export const updateContactStatus = async (email, status) => {
  try {
    const { data } = await axios.patch(`${BACKEND_URL}/contacts/${email}/status`, { status });
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update contact status';
  }
};
