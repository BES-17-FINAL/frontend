import api from "./api";

const reviewService = {
    addReview(spotId, data) {
        console.log(data + "확인")
        return api.post(`/api/spots/${spotId}/reviews`, data);
    },
    getReviews(spotId) {
        return api.get(`/api/spots/${spotId}/reviews`)
    },
    getAverageRating(spotId) {
        return api.get(`/api/spots/${spotId}/rating`)
    }
}

export default reviewService;