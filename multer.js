const multer = require("multer")
const path = require("path")

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/upload/');
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
        });

        if(!storage){
            return res.json({MessageChannel})
        }

        const fileFilter = (req,file,cb)=>{
            if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
                cb(null,true)
            }else{
                cb(null,false)
            }
        }
    
    const upload = multer({ storage: storage,fileFilter:fileFilter});
    //sebenarnya bisa langsung pakai .single("foto") cuman karna mau di pake juga nanti untuk upload foto postingan
module.exports = upload