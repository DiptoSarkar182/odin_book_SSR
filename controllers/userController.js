const User = require('../models/user');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const {flash} = require('express-flash');
const {createHash} = require('../middlewares/authentication');
const upload = require('../middlewares/multer');
const cloudinary = require('../middlewares/cloudinary');
const validator = require('validator');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

exports.sign_up_get = (req,res,next)=>{
      return res.render("sign-up",{
          title: "Create a new account",
      })
};

exports.sign_up_post = [
    body("first_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("First Name is required")
     .escape(),
    
     body("last_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("Last name min length is 4")
     .escape(),
    
     body("username")
     .trim()
     .custom(async (value)=>{
        const user = await User.findOne({username: value});
        if(user){
            return await Promise.reject("Username Already Taken!");
        }
        return true;
     }),
    
     body('email')
     .custom(async (value) => {
       const user = await User.findOne({ email: value });
       if (user) {
         return await Promise.reject("Email already taken");
       }
       return true;
     })
     .isEmail().withMessage('Not a valid e-mail address'),
    
     body("password", "Password should be atleast 6 characters long")
     .trim()
     .isLength({ min: 6 })
     .escape(),
    
     body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords and confirm passwords do not match");
        }
        return true;
      }),
    
      asyncHandler(async(req,res,next)=>{
        const errors = validationResult(req);
        try {
            if (!errors.isEmpty()) {
                const urls = []
                const files = req.files;
                if (files && Array.isArray(files)) {
                    for(const file of files){
                        const { path } = file; 
                        fs.unlinkSync(path)
                    }
                }
                const user = new User({
                  username: req.body.username,
                  firstname: req.body.first_name,
                  lastname: req.body.last_name,
                  password: req.body.password,
                  email: req.body.email,
                });
                return res.render("sign-up", {
                  title: "Create a new account",
                  user: user,
                  errors: errors.array(),
                });
              }
              else{
                const uploader = async (path) => await cloudinary.uploads(path, "odin_book/profile_photo")
                const urls = []
                const files = req.files;
                for(const file of files){
                    const { path } = file; 
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }
                const passwordHash = await createHash(req.body.password);
                const user = await new User({
                    username: req.body.username,
                    firstname: req.body.first_name,
                    lastname: req.body.last_name,
                    password: passwordHash,
                    email: req.body.email,
                    files: urls,
                }).save();
          
                req.login(user, (err) => {
                    if (err) return next(err);
                    return res.redirect("/");
                  });
              }
        } catch (err) {
            return next(err);
        }
      })
    
];

exports.sign_in_get = (req,res,next)=>{
    return res.render("sign-in",{
        title: "Log in",
        errors: req.flash("SignUpMessage"),
    })
}

exports.sign_in_post =  passport.authenticate(
    "local", {
        successRedirect: "/",
        failureRedirect: "/sign-in",
        failureFlash: true,
    }
);

exports.edit_profile_get = async(req,res,next)=>{
  try {
    if(!req.user){
      return res.redirect("/sign-in");
    }
    const currentUserID = req.params.id;
    const user = await User.findOne({_id: currentUserID});
    return res.render("edit-profile",{
      title: "Edit your account",
      user: user,
    })
  } catch (err) {
    return next(err);
  }
}

exports.edit_profile_post = [
  body("first_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("First Name is required")
     .escape(),
    
     body("last_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("Last Name is required")
     .escape(),
    
     body("username")
     .trim()
     .custom(async (value)=>{
        const user = await User.findOne({username: value});
        if(user){
            return await Promise.reject("Username Already Taken!");
        }
        return true;
     }),
    
     body('email')
     .custom(async (value) => {
       const user = await User.findOne({ email: value });
       if (user) {
         return await Promise.reject("Email already taken");
       }
       return true;
     })
     .isEmail().withMessage('Not a valid e-mail address'),
    
      asyncHandler(async(req,res,next)=>{
        const errors = validationResult(req);
        try {
            if (!errors.isEmpty()) {
                const urls = []
                const files = req.files;
                for(const file of files){
                    const { path } = file; 
                    fs.unlinkSync(path)
                }
                const currentUserID = req.params.id;
                const user = await User.findById(currentUserID);
                return res.render("edit-profile", {
                  title: "Edit your account",
                  user: user,
                  errors: errors.array(),
                });
              }
              else{
                const uploader = async (path) => await cloudinary.uploads(path, "odin_book/profile_photo")
                const currentUserID = req.params.id;
                let user = await User.findOne({_id:currentUserID});
                if(user){
                  const publicId = user.files[0].id; 
                  const result = await cloudinary.deleteImage(publicId);
                  await user.updateOne({_id:currentUserID},
                    { $set: { "files": [] } });
                  if(req.method === 'POST'){
                    const urls = []
                    const files = req.files;
                    for(const file of files){
                        const { path } = file; 
                        const newPath = await uploader(path)
                        urls.push(newPath)
                        fs.unlinkSync(path)
                    }
                    user = await user.updateOne({
                      $set: {
                        username: req.body.username,
                        firstname: req.body.first_name,
                        lastname: req.body.last_name,
                        email: req.body.email,
                        files: urls,
                      }
                    },{},{new: true})
                  }
                }
                
                
          
                return res.redirect("/view-profile")
              }
        } catch (err) {
            return next(err);
        }
      })
];

exports.change_password_get = (req,res,next)=>{
  if(!req.user){
      return res.redirect("/sign-in");
    }
  return res.render("change-password",{
    title: "Change Password"
  })
}

exports.change_password_post = [
  body("current_password", "Password should be atleast 6 characters long")
     .trim()
     .isLength({ min: 6 })
     .custom(async (value, { req }) => {
      const user = await User.findOne({ _id: req.params.id });
      const res = await bcrypt.compare(value, user.password);
      if (!res) {
        return await Promise.reject("Current password do not match!");
      }
      return true;
    })
     .escape(),
    body("password", "Password should be atleast 6 characters long")
     .trim()
     .isLength({ min: 6 })
     .escape(),
    
     body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password and confirm password should match");
        }
        return true;
      }),
      async(req,res,next)=>{
        const errors = validationResult(req);
        try {
          if(!errors.isEmpty()){
            return res.render("change-password",{
              title: "Change Password",
              errors: errors.array(),

            })
          }
          else{
            let user = await User.findOne({_id:req.params.id});
            if(user){
              const passwordHash = await createHash(req.body.password);
              user = await user.updateOne(
                {
                  $set: {
                    password: passwordHash,
                  }
                },{},{new: true}
              )
            }
            return res.redirect("/view-profile")
          }
        } catch (err) {
          return next(err)
        }
      }
];

exports.friends_get = async(req,res,next)=>{

  try {
    const currentUser = req.user;
    let friendsList = [];
    for(let i=0; i<currentUser.friend_list.length; i++){
        const myFriend = await User.findById(currentUser.friend_list[i]);
        friendsList.push(myFriend);
    }
    return res.render("friends",{
        title: "Friends List",
        friendsList: friendsList,
    })
  } catch (error) {
    return next(error)
  }
}

exports.suggested_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    const users = await User.find({ 
      _id: { 
        $ne: currentUser.id, 
        $nin: currentUser.friend_list,
      } 
    }).sort({ username: 1 });
    return res.render("suggested",{
      title: "People you may know",
      users: users,
    })
  } catch (error) {
    return next(error);
  }
}

exports.my_profile_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    return res.render("my-profile",{
      title: `${currentUser.fullName}'s profile`,
      currentUser: currentUser,
    })
  } catch (error) {
    return next(error)
  }
}

exports.view_others_profile_get = async(req,res,next)=>{
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); 
    return res.render("visit-profile",{
      title: "View Profile",
      user: user,
    })
  } catch (error) {
    return next(error);
  }
  
}

exports.add_friend_get = async(req,res,next)=>{
  try {
    const currentUserID = req.user.id;
    const sendingRequestTo = req.params.id;
    const receiverUserDetails = await User.findById(sendingRequestTo);
    receiverUserDetails.friend_request.push(currentUserID);
    await receiverUserDetails.save();
    
    return res.redirect("/friends/suggested")
  } catch (error) {
    return next(error);
  }
}

exports.add_friend_from_profile_get = async(req,res,next)=>{
  try {
    const currentUserID = req.user.id;
    const sendingRequestTo = req.params.id;
    const receiverUserDetails = await User.findById(sendingRequestTo);
    receiverUserDetails.friend_request.push(currentUserID);
    await receiverUserDetails.save();
    
    return res.redirect(`/friends/suggested/view-profile/${sendingRequestTo}`)
  } catch (error) {
    return next(error)
  }
}

exports.cancel_request_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    const removeRequestFrom = req.params.id;
    const findId = await User.findById(removeRequestFrom);
    findId.friend_request.pull(currentUser.id);
    await findId.save();
    return res.redirect("/friends/suggested")
  } catch (error) {
    return next(error);
  }
}

exports.cancel_request_from_profile_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    const removeRequestFrom = req.params.id;
    const findId = await User.findById(removeRequestFrom);
    findId.friend_request.pull(currentUser.id);
    await findId.save();
    return res.redirect(`/friends/suggested/view-profile/${removeRequestFrom}`)
  } catch (error) {
    return(next);
  }
}

exports.accept_request_get = async(req,res,next)=>{
  try {
    const idOfIncomingRequest = req.params.id;
    const findId = await User.findById(idOfIncomingRequest);
    const currentUser = req.user;
    currentUser.friend_list.push(findId.id);
    await currentUser.save();

    findId.friend_list.push(currentUser.id);
    await findId.save();

    currentUser.friend_request.pull(findId.id);
    await currentUser.save();
    return res.redirect("/friends/friend-requests");
  } catch (error) {
    return next(error);
  }
}

exports.accept_request_from_profile_get = async(req,res,next)=>{
  try {
    const idOfIncomingRequest = req.params.id;
    const findId = await User.findById(idOfIncomingRequest);
    const currentUser = req.user;
    currentUser.friend_list.push(findId.id);
    await currentUser.save();

    findId.friend_list.push(currentUser.id);
    await findId.save();

    currentUser.friend_request.pull(findId.id);
    await currentUser.save();
    return res.redirect(`/friends/suggested/view-profile/${idOfIncomingRequest}`)
  } catch (error) {
    return next(error);
  }
}

exports.reject_request_get = async(req,res,next)=>{
  try {
    const idOfIncomingRequest = req.params.id;
    const currentUser = req.user;
    const findId = await User.findById(idOfIncomingRequest);
    currentUser.friend_request.pull(findId.id);
    await currentUser.save();
    return res.redirect("/friends/friend-requests")
  } catch (error) {
    return next(error)
  }
}

exports.reject_request_from_profile_get = async(req,res,next)=>{
  try {
    const idOfIncomingRequest = req.params.id;
    const currentUser = req.user;
    const findId = await User.findById(idOfIncomingRequest);
    currentUser.friend_request.pull(findId.id);
    await currentUser.save();
    return res.redirect(`/friends/suggested/view-profile/${idOfIncomingRequest}`)
  } catch (error) {
    return next(error)
  }
}

exports.unfriend_get = async(req,res,next)=>{
  try {
    const idOfIncomingRequest = req.params.id;
    const findId = await User.findById(idOfIncomingRequest);
    const currentUser = req.user;
    currentUser.friend_list.pull(findId.id);
    await currentUser.save();

    findId.friend_list.pull(currentUser.id);
    await findId.save();

    return res.redirect(`/friends/suggested/view-profile/${idOfIncomingRequest}`)
  } catch (error) {
    return next(error)
  }
}

exports.friend_request_page_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    let friendRequestList = [];
    for(let i=0; i<currentUser.friend_request.length; i++){
      const myFriend = await User.findById(currentUser.friend_request[i]);
      friendRequestList.push(myFriend);
    }
    const sentRequest = await User.find({
      _id: { $ne: currentUser.id }, 
      friend_request: currentUser.id, 
    });
    return res.render("friend-requests",{
      friendRequestList: friendRequestList,
      sentRequest: sentRequest,
    })
  } catch (error) {
    return next(error)
  }
}

exports.cancel_request_friend_request_get = async(req,res,next)=>{
  try {
    const currentUser = req.user;
    const removeRequestFrom = req.params.id;
    const findId = await User.findById(removeRequestFrom);
    findId.friend_request.pull(currentUser.id);
    await findId.save();
    return res.redirect("/friends/friend-requests");
  } catch (error) {
    return next(error)
  }
}

exports.search_friends_get = (req,res,next)=>{
  if(!req.user){
      return res.redirect("/sign-in");
  }
  //req.flash('success', 'Friend request sent successfully!');
  return res.render("search-friends",{
      title: "Search friends",
      successMessage: req.flash('success'),
  })
}

exports.search_friends_post = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Username is required (4-20 characters) ")
    .escape(),
    async(req,res,next)=>{
      try {
          const currentUser = req.user.username;
          const currentUserID = req.user.id;
          const findUser = await User.findOne({username:req.body.username});
          
          if(findUser){
              if(findUser.username === currentUser){
                  res.render("search-friends",{
                      title: "Search friends",
                      userNotFound: "This is you.",
                  })
              } else{
                  res.render("search-friends",{
                      title: "Search friends",
                      userFound: findUser,
                  })
              }
          } else{
              res.render("search-friends",{
                  title: "Search friends",
                  userNotFound: "User does not exist!",
              })
          }
      } catch (err) {
          return next(err);
      }
    },
];

exports.log_out = (req,res,next)=>{
    req.logout((err)=>{
      if(err){
        return next(err)
      }
      return res.redirect("/sign-in");
    })
}