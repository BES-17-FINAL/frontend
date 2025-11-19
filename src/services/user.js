import api from "./api"

const userService = {
    getUser() {
        return api.get("/api/user/me")
    },
    editUser(data) {
        console.log("userservice", data);
        return api.put("/api/user/edit", data)
    }
}

export default userService;