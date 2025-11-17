import reviewService from "../services/review"
import { create } from "zustand"

const useReviewStore = create((set) => ({
    reviews: null,
    loading: false,
    error: null,

    addReview: async (spotId, data) => {
        set({ loading: true, error: null});
        try {
            const response = await reviewService.addReview(spotId, data);
            set({ spot: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    getReviews: async (spotId) => {
        set({ loading: true, error: null});
        try {
            const response = await reviewService.getReviews(spotId);
            set({ spot: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    getAverageRating: async (spotId) => {
        set({ loading: true, error: null});
        try {
            const response = await reviewService.getAverageRating(spotId);
            set({ spot: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    }
}))

export default useReviewStore;