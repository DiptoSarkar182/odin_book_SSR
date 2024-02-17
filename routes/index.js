var express = require('express');
var router = express.Router();

const upload = require('../middlewares/multer')

const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("home-page");
});

router.get("/sign-up", userController.sign_up_get);
router.post("/sign-up", upload.array('avatar',1), userController.sign_up_post);
router.get("/sign-in", userController.sign_in_get);
router.post("/sign-in", userController.sign_in_post);

router.get("/friends", userController.friends_get);
router.get("/friends/suggested", userController.suggested_get);

router.get("/view-profile",userController.my_profile_get);
router.get("/view-profile/edit-profile/:id", userController.edit_profile_get);
router.post("/view-profile/edit-profile/:id", upload.array('avatar',1), userController.edit_profile_post);
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

router.get("/log-out", userController.log_out);

module.exports = router;
