import { create } from "zustand";
import userService from "../services/user";

const useUserStore = create((set) => ({
    user: null,
    loading: false,
    error: null,

    getUser: async () => {
        set({ loading: true, error: null });
        try {
            const response = await userService.getUser()
            set({ user: response.data, loading: false})
            return response.data
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    editUser: async (data) => {
        set({ loading: true, error: null });
        try {
            console.log("userStore", data);
            const response = await userService.editUser(data)
            set({ user: response.data, loading: false})
            return response.data
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    }
}))

export default useUserStore;