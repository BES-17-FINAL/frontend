import api from "./api";

const postService = {
    getUserPost(userId) {
        return api.get(`api/posts/user/${userId}`);
    }
}

export default postService;