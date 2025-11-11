import api from "../services/api"

const spotService = {
    getSpot(spotId) {
        return api.get(`/api/spot/${spotId}`);
    },
    getFameSpots() {
        return api.get('/api/spot/fameSpot');
    }
}

export default spotService;