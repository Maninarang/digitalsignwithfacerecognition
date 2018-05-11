var cors = require('cors')
var path = require('path');
var express = require('express');
// var multer = require('multer');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var formidable = require('formidable');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var pdftohtml = require('pdftohtmljs');
var base64Img = require('base64-img');
var urlencodedParser = bodyParser.urlencoded({
	extended: true
})

var fs=require('fs');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
var PDFImage = require("pdf-image").PDFImage;


router.use(bodyParser.urlencoded({limit: '50mb',extended: true,parameterLimit: 1000000}));   // { extended: true} to parse everything.if false it will parse only String
router.use(bodyParser.json({limit: '50mb'}));

router.use(cors())
var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');

router.use(express.static('html/'));
// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/update', update);
router.post('/upload',upload);
router.post('/delete',userdelete);
router.post('/email',useremail);



function update(req,res){
//  console.log(req.body)
 var userid      = req.body.user_id;
var phonenumber =req.body.phonenumber;
var name       =req.body.name;
var sec_email   =req.body.sec_email;


User.find({_id :userid},function(err, result) {
  if (err) {
    res.status('400').json({
      msg:"user not found",
    data:err
    })
  }else{
    // console.log(result);
    var myquery = {_id :userid };
  var newvalues = { $set: {
     phonenumber :phonenumber,
     name       :name,
     secEmail  :sec_email
  } };
    User.updateOne(myquery, newvalues, function(err, result) {
      if (err) {
        console.log("failed to updated");
        res.status('400').json({
          msg:"data upadted failed",
        data:err
        })
      }else{
        User.find({_id :userid},function(err, result) {
          if (err) {
            res.status('400').json({
              msg:"user not found",
            data:err
            })
          }else{


        console.log("1 document updated");
        res.status('200').json({
          msg:"data upadted sucessfully",
        data:result
        })
      }
    })
  }
      
    });

  }
  // db.close();
});

 console.log("req")

}

// ---------------------------------------------------
function userdelete(req,res){
  userid=req.body.id;
  console.log(userid)
  User.find({_id :userid},function(err, result) {
    if (err) {
      console.log('user not found')
      res.status('400').json({
                msg:"user not found",
    })}
    else{
 console.log('user found')
 User.remove({_id :userid},function(err, result) {
  if (err) {
    console.log('user deleted not found')
    res.status('400').json({
      msg:"failed to delete user",
})
  }
  else{
console.log('user deleted')
res.status('200').json({
  msg:"sucess",
})
  }
    // }
 } )

    }
})
}

// =========================================================/
function useremail(req,res){
  var ts = new Date().getTime();
  email=req.body.email;
  image64=req.body.image;
  // console.log(userid)
  User.find({email :email},function(err, result) {
    if (err) {
      console.log('user not found')
      res.status('400').json({
                msg:"user not found",
    })
  }
    else{
      var dir =path.join(__basedir,'/images/images/login/')+ts;
      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        base64Img.img(image64, dir, 'image_'+ts, function(err, filepath) {
          if(err) 
          {
            console.log(err)
            res.send(err)
          }
        var token;
        //token = user.generateJwt();
        var image=__basedir+'/images/images/login/'+ts+'/'+'image_'+ts;
        res.status(200);
        res.json({
          knownimage:__basedir+'/images/images/'+ result[0]._id +"/"+result[0].image,
         unknownimage:image,
         


        });
      });
    }
  }
  });
}
//  console.log('user found')
//  console.log(result.image)
//  res.status('200').json({
//   image:result[0].image,
// })

//     }
// })
// }
//   User.remove( {"_id": ObjectId("5ae1b6b402b5423c7fbc5db9")});
//   User.find({_id :userid},function(err, result) {
//     if (err) {
//       res.status('400').json({
//         msg:"user not found",
//       data:err
//       })
//     }else{
//       console.log('user found')
//       User.remove({_id :userid}),function(err,res){
//         if(err){
//           res.status('400').json({
//             msg:"user not found",
//           data:err})
//         }
//         else{
//           res.status('200').json({
//             msg:"user deleted",
//           data:""
//           })
//         }
//       }
// }
//   })
// }
// ----------------------------------------------------
 function upload (req, res) {
  console.log("upload")
  // var form = new formidable.IncomingForm();
  //   form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = '../pdf/' + files.filetoupload.name;
      sampleFile = req.files.filetoupload;
      sampleFile.mv('../' + newfilename[0], function (err,suc) {
				if (err) {
					res.status(500).send(err);
				} else {
          res.status(200).send(suc);
        }})
      // fs.rename(oldpath, newpath, function (err) {
      //   if (err) {Request header field security-token is not allowed by Access-Control-Allow-Headers in preflight response
      //     throw err;
      //     console.log('im')
      //   }
      //   //res.write('File uploaded and moved!');
      //   //res.end();
      //   else{
      //     console.log('im')
          
      //     res.status(200).json({
      //       url:'/home/pc/Desktop/jagveer/face-recognition/pdf/' + files.filetoupload.name
      //     })
      //   }
        
      // });
//  });
}




router.post("/uploadfile", function(req,res){
  //global.appRoot = path.resolve(__dirname);
  console.log(global.appRoot)
  // var str= global.appRoot;
  // var rest = str.substring(0, str.lastIndexOf("/") + 0);
  // var last = rest.substring(0, rest.lastIndexOf("/") + 1);

  var ts = new Date().getTime();
  var dir =path.join(__basedir,'/uploadedpdf/uploadedpdf/')+ts;
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var timestamp =new Date().getTime();
      // /home/pc/Desktop/ezeesteve/pdf
      var newpath = path.join(__basedir,'/uploadedpdf/uploadedpdf/')+ts+'/' + 'pdf.pdf';
      console.log(newpath)
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
         res.status(503).json({
           error: "Something went Wrong.Please Try Agiain.."
         })
        }
        else {
          // res.status(200).json({
          //   // file:"http://127.0.0.1:3000/html/"+new_name+".html"
          //   file:path.join(__basedir,'/uploadedpdf/uploadedpdf/')+ts +'/'+ files.filetoupload.name
            
          //   })
           
          var pdfImage = new PDFImage(path.join(__basedir,'/uploadedpdf/uploadedpdf/')+ts +'/'+ 'pdf.pdf');
          pdfImage.convertFile().then(function (imagePaths) {
            res.status(200).json({
                // file:"http://127.0.0.1:3000/html/"+new_name+".html"
                path:'/uploadedpdf/'+ts +'/'+ 'pdf.pdf',
                pdfid:ts
                
                })
           }, function (err) {
            res.status(503).json({
              error: "Something went Wrong.Please Try Agiain.."
            })
          });
        }
      });
    })
}

})

 
router.post("/pdfdetail", function(req,res){
 // console.log(req.body.pdfid)
  const pdfid = req.body.pdfid;
  const dir = path.join(__basedir,'/uploadedpdf/uploadedpdf/')+pdfid;

   fs.readdir(dir, (err, files) => {
 // console.log(files.length);
  res.status(200).json({
    fileslength: files.length - 1,
  })
   });
})


module.exports = router;
