import { create } from "zustand";
import spotService from "../services/spot";

const useSpotStore = create((set) => ({
  spot: null,
  loading: false,
  error: null,

  getSpot: async (spotId) => {
    set({ loading: true, error: null });
    try {
      const response = await spotService.getSpot(spotId);
      set({ spot: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  getFameSpots: async () => {
    set({ loading: true, error: null });
    try {
      const response = await spotService.getFameSpots();
      set({ spot: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
}));

export default useSpotStore;