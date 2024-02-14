const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images");
    },
  });

  const fileFilter =  (req, file, cb ) =>{
    if(file.mimetype === "image/jpeg" || file.mimetype === 'image/png'){
        cb(null, true)
    } else {
        //reject file 
        cb({message: "Unsupported file format"}, false)
    }
}


  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //limit to 5MB
    fileFilter: fileFilter
  });

module.exports = upload;