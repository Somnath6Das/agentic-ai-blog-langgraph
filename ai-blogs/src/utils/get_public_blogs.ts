import api from "./api";

export interface Blog {
  id: number;
  user_id: number;
  post_id: number;
  title: string;
  html_path: string;
  image: string;
  created_at: string;
}

export const getPublicBlogs = async (): Promise<Blog[]> => {
  const res = await api.get<Blog[]>("/public/blogs");
  return res.data;
};
