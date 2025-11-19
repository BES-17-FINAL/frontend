// src/store/festivalStore.jsx

import { create } from "zustand";
import festivalService from "../services/festival";

const useFestivalStore = create((set) => ({
  festivals: [],
  loading: false,
  error: null,

  getOngoingFestivals: async () => {
    set({ loading: true, error: null });

    try {
      const response = await festivalService.getOngoingFestivals();
      set({ festivals: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error("진행 중 축제 불러오기 실패:", error);
      set({ error: error.message, loading: false, festivals: [] });
      return null;
    }
  },
}));

export default useFestivalStore;
