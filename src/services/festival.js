// src/services/festival.js

import api from "../services/api";

const festivalService = {
  getOngoingFestivals() {
    return api.get("/api/festival/ongoing");
  },
};

export default festivalService;
