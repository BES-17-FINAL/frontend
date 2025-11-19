import { create } from "zustand";
import postService from "../services/post";

const usePostStore = create((set) => ({
    post: null,
    loading: false,
    error: null,

    getUserPost: async (userId) => {
        set({ loading: true, error: null });
        try {
          const response = await postService.getUserPost(spotId);
          set({ spot: response.data, loading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          return null;
        }
    }
}));

export default usePostStore;