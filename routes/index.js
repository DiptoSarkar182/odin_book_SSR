var express = require('express');
var router = express.Router();

const upload = require('../middlewares/multer')

const userController = require('../controllers/userController')

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
router.get("/friends/suggested/view-profile/:id", userController.view_others_profile_get);
router.get("/friends/suggested/add-friend/:id", userController.add_friend_get);
router.get("/friends/suggested/cancel-request/:id", userController.cancel_request_get);
router.get("/friends/suggested/accept-request/:id", userController.accept_request_get);
router.get("/friends/suggested/reject-request/:id", userController.reject_request_get);
router.get("/friends/view-profile/:id",userController.view_others_profile_get);
router.get("/friends/suggested/view-profile/add-friend/:id", userController.add_friend_from_profile_get);
router.get("/friends/suggested/view-profile/cancel-request/:id", userController.cancel_request_from_profile_get);
router.get("/friends/suggested/view-profile/accept-request/:id", userController.accept_request_from_profile_get);
router.get("/friends/suggested/view-profile/reject-request/:id", userController.reject_request_from_profile_get);

router.get("/log-out", userController.log_out);

module.exports = router;
