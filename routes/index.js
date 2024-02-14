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
router.get("/log-out", userController.log_out);

module.exports = router;
