import useAuthStore from "@/store/auth_store";
import api from "./api";

export const handleResult = async (uri: string) => {
  const user = useAuthStore.getState().user;
  // console.log(user);

  const filename = uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
  const ext = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase() ?? "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  const formData = new FormData();
  // React Native's axios accepts this same special shape to represent a file.
  formData.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as any);
  formData.append("user", JSON.stringify(user));
  await api.patch<{ url: string }>(
    "/profile/upload",
    formData,

    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};
