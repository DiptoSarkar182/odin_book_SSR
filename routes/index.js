var express = require('express');
var router = express.Router();

const upload = require('../middlewares/multer')

const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

/* GET home page. */
router.get('/', postController.homepage_get);

router.get("/sign-up", userController.sign_up_get);
router.post("/sign-up", upload.array('avatar',1), userController.sign_up_post);
router.get("/sign-in", userController.sign_in_get);
router.post("/sign-in", userController.sign_in_post);

router.get("/friends", userController.friends_get);
router.get("/friends/suggested", userController.suggested_get);

router.get("/view-profile",userController.my_profile_get);
router.get("/view-profile/edit-profile/:id", userController.edit_profile_get);
router.post("/view-profile/edit-profile/:id", userController.edit_profile_post);

router.get("/view-profile/change-profile-photo/:id", userController.change_profile_photo_get);
router.post("/view-profile/change-profile-photo/:id", upload.array('avatar',1), userController.change_profile_photo_post);

router.get("/view-profile/change-password/:id", userController.change_password_get);
router.post("/view-profile/change-password/:id", userController.change_password_post);
router.get("/friends/suggested/view-profile/:id", userController.view_others_profile_get);

router.get("/friends/suggested/add-friend/:id", userController.add_friend_get);
router.get("/friends/suggested/cancel-request/:id", userController.cancel_request_get);

router.get("/friends/friend-requests/accept-request/:id", userController.accept_request_get);
router.get("/friends/friend-requests/reject-request/:id", userController.reject_request_get);

router.get("/friends/view-profile/:id",userController.view_others_profile_get);
router.get("/friends/suggested/view-profile/add-friend/:id", userController.add_friend_from_profile_get);
router.get("/friends/suggested/view-profile/cancel-request/:id", userController.cancel_request_from_profile_get);

router.get("/friends/suggested/view-profile/accept-request/:id", userController.accept_request_from_profile_get);
router.get("/friends/suggested/view-profile/reject-request/:id", userController.reject_request_from_profile_get);

router.get("/friends/suggested/view-profile/unfriend/:id", userController.unfriend_get);
router.get("/friends/friend-requests", userController.friend_request_page_get);

router.get("/friends/friend-requests/cancel-request/:id", userController.cancel_request_friend_request_get);
router.get("/friends/search-friends", userController.search_friends_get);
router.post("/friends/search-friends", userController.search_friends_post);

router.get("/posts", postController.posts_get);
router.post("/posts", upload.array('post_image',1), postController.posts_post);
router.get("/like-post/:id", postController.post_like_get);
router.get("/dislike-post/:id", postController.post_dislike_get);
router.post("/", postController.add_post_comment);
router.get("/delete-comment/:id", postController.delete_comment_get);
router.get("/like-comment/:id", postController.comment_like_get);
router.get("/dislike-comment/:id", postController.comment_dislike_get);

router.get("/view-profile/delete-post/:id", postController.delete_post_get);
router.get("/view-profile/like-post/:id", postController.my_profile_like_post);
router.get("/view-profile/dislike-post/:id", postController.my_profile_dislike_post);

router.post("/view-profile", postController.my_profile_add_post_comment);
router.get("/view-profile/like-comment/:id", postController.my_profile_comment_like_get);
router.get("/view-profile/dislike-comment/:id", postController.my_profile_comment_dislike_get);
router.get("/view-profile/delete-comment/:id", postController.my_profile_delete_comment_get);

router.get("/view-profile/edit-post/:id", postController.my_profile_edit_post_get);
router.post("/view-profile/edit-post/:id", upload.array('post_image',1), postController.my_profile_edit_post_post);

router.get("/friends/suggested/view-profile/like-post/:id_1/:id_2", postController.others_profile_post_like_get);
router.get("/friends/suggested/view-profile/dislike-post/:id_1/:id_2", postController.others_profile_post_dislike_get);

router.post("/friends/suggested/view-profile/:id", postController.others_profile_add_post_comment);

router.get("/friends/suggested/view-profile/like-comment/:id_1/:id_2", postController.others_profile_comment_like_get);
router.get("/friends/suggested/view-profile/dislike-comment/:id_1/:id_2", postController.others_profile_comment_dislike_get);
router.get("/friends/suggested/view-profile/delete-comment/:id_1/:id_2", postController.others_profile_delete_comment_get);

router.get("/view-profile/delete-account/:id", userController.delete_user_account_get);
router.post("/view-profile/delete-account/:id", userController.delete_user_account_post);

router.get("/log-out", userController.log_out);

module.exports = router;
