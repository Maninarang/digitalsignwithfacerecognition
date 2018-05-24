var cors = require('cors')
var path = require('path');
var express = require('express');
// var multer = require('multer');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Document = mongoose.model('Document');
var Contact= mongoose.model('Contact');
var formidable = require('formidable');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var pdftohtml = require('pdftohtmljs');
var base64Img = require('base64-img');
var urlencodedParser = bodyParser.urlencoded({
	extended: true
})
var nodemailer = require('nodemailer');
var fs=require('fs');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
var PDFImage = require("pdf-image").PDFImage;
var createHTML = require('create-html');


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

// ----------------------------- get users's list ----------------------- // 


router.get("/userlist/:userId/:docId", function(req,res){
  Contact.find({userId: req.params.userId,docrefId: req.params.docId},'firstName lastName email',function(err, users) {
  if (err) {
    res.status(400).json({
    data:err
    })
  }else{
        res.status(200).json({
        data:users
    });
  }
})
})

// -------------------------  get user detail ---------------------------- //

router.get("/userdetail/:userid/:docid", function(req,res){
  Contact.findOne({_id:req.params.userid,docrefId: req.params.docid},'firstName lastName email',function(err, user) {
    if (err) {
      res.status(400).json({
      msg:"user not found",
      data:err
      })
    }else{
      res.status(200).json({
      data:user
      });
    }
  })
})

// -------------------------  save html --------------------------------- //

router.post('/savehtml', function (req, res) {
  // var html = createHTML({
  //   body: req.body.html
  // })
  // fs.writeFile(path.join(__basedir,'/uploadedpdf/uploadedpdf/')+req.body.pdfid+'/'+req.body.pdfid+'.html', html, function (err) {
  //   if (err) {
  //     res.status(400).json({
  //       message : err
  //     })
  //   } else {
  var document = new Document();
  document.documentid = req.body.pdfid;
  document.userid = req.body.userid;
  document.documenthtml = req.body.html;
  document.actionrequired = 'Pending';
  document.expiration = req.body.expdate;
  document.save(function(err,document) {
    if(err){
      res.status(400).json({
        message : err
      });
    } else {
     // console.log(document._id);
     Contact.update({docrefId: req.body.docid},{$set:{saveddocId: document._id}},function(err,update) {
       if(err) {
         res.status(400).json({
           message: err
         })
       } else {
       
        res.status(200).json({
                 message: 'Success'
               })
       }
     })
   
    }
 
  })
// }
//   })
})


//---------------------------- send document ------------------------- //


router.post('/senddocument', function (req, res) {

  var document = new Document();
  document.documentid = req.body.pdfid;
  document.userid = req.body.userid;
  document.documenthtml = req.body.html;
  document.actionrequired = 'Completed';
  document.expiration = req.body.expdate;
  document.save(function(err,document) {
    if(err){
      res.status(400).json({
        message : err
      });
    } else {
     // console.log(document._id);
     Contact.update({docrefId: req.body.docid},{$set:{saveddocId: document._id}},function(err,update) {
       if(err) {
         res.status(400).json({
           message: err
         })
       } else {
        Contact.findOne({docrefId: req.body.docid,priority : 1}, 'email',function(err,data) {
          var toEmailAddress = data.email;
          var mailAccountUser = 'work.jagveer@gmail.com'
          var mailAccountPassword = 'jagveer@123'
          var fromEmailAddress = 'work.jagveer@gmail.com'
          var transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailAccountUser,
              pass: mailAccountPassword
            }
          })
          var mail = {
            from: fromEmailAddress,
            to: toEmailAddress,
            subject: "EzeeSteve Document Sign ",
            html: '<p>Click <a href="https://localhost:4200/signpdf/' +  document._id + '">here</a></p>' 
          }
      
          transport.sendMail(mail, function (error, response) {
            if (error) {
              res.json({
                success: error,
                message: "Something went wrong.Please Try Again"
              })
            } else {
             res.status(200).json({
               message: 'Email Sent Successfully'
             })
            }
      
            transport.close();
          });
        })
       }
     })
   
    }
 
  })

})

// --------------------------- get document -------------------------//\

router.get('/getdocument/:userid/:documentid',function(req,res) {

  Document.findOne({_id:req.params.documentid,userid:req.params.userid},'documenthtml',function(err,dochtml) {
   if(err) {
     res.status(400).json({
       message:err
     })
   } else {
     res.status(200).json({
       data:dochtml
     })
   }
  
  })
})

// ----------------------- get document count ------------------------- //

router.get('/documentcount/:userid',function(req,res) {

  Document.find({userid:req.params.userid}).count(function(err,count) {
  if(err) {
    res.status(400).json({
      message:err
    })
  } else {
    var documentcount = count+"";
    while (documentcount.length < 8) documentcount = "0" + documentcount;
    res.status(200).json({
      data:documentcount
    })
  }

  }) 

})

// ----------------------- check user is eligible to open doc or not ------------------------- //

router.get('/checkeligibility/:useremail/:docid',function(req,res) {

  Contact.find({userid:req.params.userid,saveddocId: req.params.docid}).count(function(err,count) {
  if(err) {
    res.status(400).json({
      message:err
    })
  } else {
    if(count>0) {
      res.status(200).json({
        data:1                   // 1 - user is eligible
      })
    } else {
      res.status(400).json({
        data:0                   // 0 - user is  not eligible
      })
    }
  }

  }) 

})

//--------------------------- add new participant --------------------- //

router.post('/addnewparticipant', function(req,res) {
  const contact = new Contact();
  contact.userId = req.body.userId;
  contact.firstName = req.body.firstName;
  contact.lastName = req.body.lastName;
  contact.email = req.body.email;
  contact.address = req.body.address;
  contact.subject = req.body.subject;
  contact.message = req.body.message;
  contact.docrefId = req.body.docId;
  contact.priority = req.body.priority;
  contact.type = req.body.type;
  // User.findOne({email:req.body.email}).count(function(err,count) {
  //   if(err) {
  //     res.status(400).json({
  //       message:err
  //     })
  //   } else {
  //     if(count>0) {
  //       res.status(200).json({
  //         message : 2                    // 2 = user already in your contact list
  //       })
  //     }
  //     else {
  Contact.findOne({email:req.body.email,userId:req.body.userId}).count(function(err,count) {
    if(err) {
      res.status(400).json({
        message: err
      })
    } else {
      if(count>0) {
        res.status(200).json({
          message : 1               // 1 = contact created successfully
        })
      }
      else {
        contact.save(function(err,contact) {
          if(err){
            res.status(400).json({
              message : err
            });
          } else {
            res.status(200).json({
              message : 1               // 1 = contact created successfully
            })
          }
      })
      }
    }
  })
 
  //     }
  //   }
  // })
})


// ------------------------------ get user contacts ----------------------//

router.get('/mycontacts/:userid',function(req,res) {
Contact.find({userId:req.params.userid},'email firstName lastName',function(err,contacts) {
  if(err) {
    res.status(400).json({
     message: err
    })
  } else {
    res.status(200).json({
      data:contacts
    })
  }
})
})

//------------------------------ get user contact detail ------------------ //

router.get('/contactdetail/:email/:userid',function(req,res) {
Contact.find({userId:req.params.userid,email:req.params.email},'email firstName lastName type',function(err,contactdetail) {
  if(err) {
    res.status(400).json({
      message:err
    })
  } else {
    res.status(200).json({
      data: contactdetail
    })
  }
})
})

router.post('/updatedoc', function(req,res) {
 Document.updateOne({_id: req.body.docid},{$set:{documenthtml:req.body.html}},function(err,update) {
   if(err) {
     res.status(400).json({
       message: err
     })
   } else {
 Contact.updateOne({saveddocId: req.body.docid,email:req.body.useremail},{$set:{status:'Signed'}},function(err,status) {
   if (err) {
     res.status(400).json({
       message:err
     })
   } else {
 Contact.findOne({saveddocId:req.body.docid,email:{$ne:req.body.useremail},status:'Not Signed'},'email',function(err,user) {
   if(err) {
    res.status(400).json({
      message:err
    })
   } else {
     if(!user) {
    res.status(200).json({
       message:'success'
    })
     } else {
          var toEmailAddress = user.email;
          var mailAccountUser = 'work.jagveer@gmail.com'
          var mailAccountPassword = 'jagveer@123'
          var fromEmailAddress = 'work.jagveer@gmail.com'
          var transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailAccountUser,
              pass: mailAccountPassword
            }
          })
          var mail = {
            from: fromEmailAddress,
            to: toEmailAddress,
            subject: "EzeeSteve Document Sign ",
            html: '<p>Click <a href="https://localhost:4200/signpdf/' +  req.body.docid + '">here</a></p>' 
          }
      
          transport.sendMail(mail, function (error, response) {
            if (error) {
              res.json({
                success: error,
                message: "Something went wrong.Please Try Again"
              })
            } else {
             res.status(200).json({
               message: 'Success'
             })
            }
      
            transport.close();
          });
     } 
   }
 }) 
   }
 })    
   }
 })  
})

module.exports = router;