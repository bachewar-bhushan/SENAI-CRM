import axios from 'axios';
import { BACKEND_URL } from '../config/env';

export const getDashboardStats = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/analytics/dashboard/stats`);
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dashboard stats';
  }
};

export const getSentimentTrend = async (sender, days = 30) => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/analytics/sentiment-trend`, {
      params: { sender, days },
    });
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch sentiment trend';
  }
};

export const getCategoryBreakdown = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/analytics/category-breakdown`);
    return data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch category breakdown';
  }
};
