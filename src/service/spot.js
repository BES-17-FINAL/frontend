import api from "./api"

const spotService = {
    getSpot(spotId) {
        return api.get(`/api/spot/${spotId}`);
    },
}

export default spotService;