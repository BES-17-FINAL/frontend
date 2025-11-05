import { create } from "zustand";
import spotService from "../service/spot";

const useSpotStore = create((set) => ({
  spot: null,
  loading: false,
  error: null,

  getSpot: async (spotId) => {
    set({ loading: true, error: null });
    try {
      const response = await spotService.getSpot(spotId);
      set({ spot: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useSpotStore;