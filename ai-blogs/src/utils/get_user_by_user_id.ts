import { User } from "@/store/auth_store";
import api from "./api";

export const getUserByUserId = async (user_id: number): Promise<User> => {
  const response = await api.get<User>(`/public/user/${user_id}`);
  return response.data;
};
