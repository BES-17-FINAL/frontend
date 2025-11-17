import api from "./api";

const reviewService = {
    addReview(spotId, data){
        return api.post(`/api/spots/${spotId}/reviews`, data)
    },
    getReviews(spotId) {
        return api.get(`/api/spots/${spotId}/reviews`)
    },
    getAverageRating(spotId) {
        return api.get(`/api/spots/${spotId}/{spotId}/rating`)
    }
}

export default reviewService;