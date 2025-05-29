import { API_URL } from '@/configs/API';

const fetchData = async (path: string, options: RequestInit) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(`${API_URL}/api/${path}`, options);

  if (response.status === 403) {
    throw new Error("You don't have permissions!");
  }

  if (!response.ok) {
    throw new Error(`Error (${response.status}): ${response.statusText}`);
  }

  return response;
};

export { fetchData };
