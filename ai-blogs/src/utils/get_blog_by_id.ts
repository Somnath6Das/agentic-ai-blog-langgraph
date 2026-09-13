import api from "./api";
import { Blog } from "./get_public_blogs";

export const getBlogById = async (blogId: number): Promise<Blog> => {
  const response = await api.get<Blog>(`/public/single/${blogId}`);
  return response.data;
};
