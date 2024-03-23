import axios from "axios";

const privateAxios = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    //   "Access-Control-Allow-Origin": "*",
    },
  });

  instance.interceptors.request.use(function (config) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });

  return instance;
};

export default privateAxios;
