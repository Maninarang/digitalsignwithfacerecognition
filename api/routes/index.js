var cors = require('cors')
var path = require('path');
var express = require('express');
// var multer = require('multer');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Document = mongoose.model('Document');
var DocStatus = mongoose.model('DocumentStatus');
var Contact = mongoose.model('Contact');
var formidable = require('formidable');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var pdftohtml = require('pdftohtmljs');
var base64Img = require('base64-img');
var urlencodedParser = bodyParser.urlencoded({
  extended: true
})
var nodemailer = require('nodemailer');
var fs = require('fs');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
const requestIp = require('request-ip');
var PDFImage = require("pdf-image").PDFImage;
var createHTML = require('create-html');


router.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));   // { extended: true} to parse everything.if false it will parse only String
router.use(bodyParser.json({ limit: '50mb' }));
router.use(requestIp.mw())
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
router.post('/upload', upload);
router.post('/delete', userdelete);
router.post('/email', useremail);

router.post('/sendmail', sendmail);

function update(req, res) {
  //  console.log(req.body)
  var userid = req.body.user_id;
  var phonenumber = req.body.phonenumber;
  var name = req.body.name;
  var sec_email = req.body.sec_email;


  User.find({ _id: userid }, function (err, result) {
    if (err) {
      res.status('400').json({
        msg: "user not found",
        data: err
      })
    } else {
      // console.log(result);
      var myquery = { _id: userid };
      var newvalues = {
        $set: {
          phonenumber: phonenumber,
          name: name,
          secEmail: sec_email
        }
      };
      User.updateOne(myquery, newvalues, function (err, result) {
        if (err) {
          console.log("failed to updated");
          res.status('400').json({
            msg: "data upadted failed",
            data: err
          })
        } else {
          User.find({ _id: userid }, function (err, result) {
            if (err) {
              res.status('400').json({
                msg: "user not found",
                data: err
              })
            } else {


              console.log("1 document updated");
              res.status('200').json({
                msg: "data upadted sucessfully",
                data: result
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
function userdelete(req, res) {
  userid = req.body.id;
  console.log(userid)
  User.find({ _id: userid }, function (err, result) {
    if (err) {
      console.log('user not found')
      res.status('400').json({
        msg: "user not found",
      })
    }
    else {
      console.log('user found')
      User.remove({ _id: userid }, function (err, result) {
        if (err) {
          console.log('user deleted not found')
          res.status('400').json({
            msg: "failed to delete user",
          })
        }
        else {
          console.log('user deleted')
          res.status('200').json({
            msg: "sucess",
          })
        }
        // }
      })

    }
  })
}
// ======================================================================/
function sendmail(req, res) {
  console.log("i m in sendmail function", req.body)
  var toEmailAddress = req.body.to;
  var onlydate = new Date().toUTCString()
  console.log("onlydate->", onlydate)

  var mailAccountUser = 'signup.ezeesteve@gmail.com'
  var mailAccountPassword = 'steve@098'
  var fromEmailAddress = 'signup.ezeesteve@gmail.com' 
  var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailAccountUser,
      pass: mailAccountPassword
    }
  })
  var uri = req.body.url;
  var lastslashindex = uri.lastIndexOf('/');
  var result = uri.substring(lastslashindex + 1);
  var url = 'https://mybitrade.com/confirm/' + result;

  //  var x ='https://mybitrade.com:3001/images/5ae6a99e1bf48a65c66d0d5e/image_1525066142567.jpg';
  if (req.body.imageurl == 'none') {
    var click = "<div>Image Not Avalible</div>";

  }
  else {
    var click = "<div><img src='" + req.body.imageurl + "' style='height:130px'/></div>";

  }

  // var img= "<div><img src='"+ x +"'/></div>";

  var template = '<body><table width="100%" cellpadding="0" cellspacing="0">' +
    ' <tbody><tr><td valign="top" align="center">' +
    '<table width="90%" border="0" style="font-family:Myriad Pro;border:30px solid #858f03">' +
    '<tbody> <tr><td valign="top"><table width="100%" height="40" border="0" cellpadding="0" cellspacing="0">' +
    '  <tbody>  <tr><td height="3" colspan="2"></td> </tr><tr>' +
    '  <td style="width:50%!important" align="left" valign="middle">' +
    click + '</td>' +
    '<td align="right" valign="top"><table border="0" width="100%" align="left" cellspacing="2" height="120">' +
    '<tbody> <tr><td height="50" style="border:none!important">' +
    '<div style="border:10px solid #b59848;width:295px;height:170px;float:right;margin:1.5% 3% 1% 0%">' +
    '<div style="width:280px;height:145px;border:2px solid #b59848;margin:auto;margin-top:1%;font-family:Verdana,Geneva,sans-serif;font-size:14px;padding:15px 0px 0px 5px">' +
    'This email was sent to you from:<br><br>United States<div>Mobile: <span>7889259983</span> </div>' +
    '<div>Email ID:  <span><a href="" target="_blank">info@gmail.com</a></span>' +
    '</div></div> </div>  </td></tr></tbody></table></td> </tr></tbody> </table> </td> </tr>' +
    '<tr> <td colspan="2"> <table width="100%" cellpadding="2" cellspacing="2" border="0" style="background:#f1f1f1">' +
    '<tbody><tr><td colspan="6"><table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    ' <tbody> <tr style="background:#858f03;height:40px">' +
    '<td style="width:60%!important;font-size:28px;padding-left:10px;color:#fff" colspan="2" valign="middle">Signing Participant Invitation</td>' +
    '<td style="width:40%!important;padding-right:10px;color:#fff" align="right" valign="middle">' +
    '<strong>Date: </strong>&nbsp;<span tabindex="0"><span>' + onlydate + '</span></span>' +
    '</td></tr> </tbody></table></td></tr><tr>' +
    '<td valign="top" colspan="6" align="center" style="font-family:Myriad Pro;font-size:14px;padding:10px 4px 5px 4px;color:#383838;line-height:22px">' +
    '<table width="99%" border="0" cellspacing="0" cellpadding="0"><tbody> <tr>' +
    '<td valign="top" style="text-align:left;padding-left:4px;padding-right:4px">' +
    '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    '<tbody> <tr> <td style="font-family:Myriad Pro;font-size:15px;padding-top:10px"><strong>Dear ' + req.body.name + ',</strong></td>' +
    ' </tr></tbody> </table></td></tr><tr>' +
    '<td colspan="6" style="font-family:Myriad Pro;font-size:22px!important;padding:10px 4px 5px 4px">' +
    'Your have been Registered Successfully.<br> Click the link below to verify and activate your account.<br>' +
    '<strong><a href="' + url + '" target="_blank" >Click Here</a></strong> <br>If the link does not work, copy the below url and paste it to the address bar.' +
    '</td></tr><tr><td colspan="6" style="font-family:Myriad Pro;font-size:15px;padding:10px 4px 0px 4px">EzeeSteve</td>' +
    '</tr> <tr><td colspan="6" style="font-family:Myriad Pro;font-size:15px;padding:10px,4px,0px,4px">' +
    url +
    '</td> This Email was sent to you by:Team, EzeeSteve <br>   Email ID: info@ezeesteve.com</tr></tbody></table>	</td></tr></tbody></table></td> </tr>' +
    '<tr><td colspan="2"><img src="https://mybitrade.com/assets/img/ezee-logo.png" style="width:80px;height:auto;float:right;margin:10px">' +
    '</td></tr></tbody> </table></td> </tr> </tbody> </table> </body>';
  var mail = {
    from: fromEmailAddress,
    to: toEmailAddress,
    subject: "EzeeSteve Document Sign ",
    html: template
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
}
// =========================================================/
function useremail(req, res) {
  var ts = new Date().getTime();
  email = req.body.email;
  image64 = req.body.image;
  // console.log(userid)
  User.find({ email: email }, function (err, result) {
    if (err) {
      console.log('user not found')
      res.status('400').json({
        msg: "user not found",
      })
    }
    else {
      var dir = path.join(__basedir, '/images/images/login/') + ts;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        base64Img.img(image64, dir, 'image_' + ts, function (err, filepath) {
          if (err) {
            console.log(err)
            res.send(err)
          }
          var token;
          //token = user.generateJwt();
          var image = __basedir + '/images/images/login/' + ts + '/' + 'image_' + ts;
          res.status(200);
          res.json({
            knownimage: __basedir + '/images/images/' + result[0]._id + "/" + result[0].image,
            unknownimage: image,



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
function upload(req, res) {
  // console.log("upload")
  // var form = new formidable.IncomingForm();
  //   form.parse(req, function (err, fields, files) {
  var oldpath = files.filetoupload.path;
  var newpath = '../pdf/' + files.filetoupload.name;
  sampleFile = req.files.filetoupload;
  sampleFile.mv('../' + newfilename[0], function (err, suc) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(suc);
    }
  })
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




router.post("/uploadfile", function (req, res) {
  //global.appRoot = path.resolve(__dirname);
 // console.log(global.appRoot)
  // var str= global.appRoot;
  // var rest = str.substring(0, str.lastIndexOf("/") + 0);
  // var last = rest.substring(0, rest.lastIndexOf("/") + 1);

  var ts = new Date().getTime();
  var dir = path.join(__basedir, '/uploadedpdf/uploadedpdf/') + ts;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var timestamp = new Date().getTime();
      // /home/pc/Desktop/ezeesteve/pdf
      var newpath = path.join(__basedir, '/uploadedpdf/uploadedpdf/') + ts + '/' + 'pdf.pdf';
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
          const pdfImageOpts = {
            // outputDirectory: path.join(__dirname, './wmReports/images'),
            convertExtension: 'jpg',
            convertOptions: {
              '-colorspace': 'RGB',
              '-interlace': 'none',
              '-density': '300',
              '-quality': '100'
            }
          };
          var pdfImage = new PDFImage(path.join(__basedir, '/uploadedpdf/uploadedpdf/') + ts + '/' + 'pdf.pdf', pdfImageOpts);
          //  var pdfImage = new PDFImage((path.join(__basedir, '/uploadedpdf/uploadedpdf/') + ts + '/' + 'pdf.pdf'), {
          //   convertOptions: {
          //     //  "-resize": "2000x2000",
          //     "-quality": "100"
          //   }
          // });
          pdfImage.convertFile().then(function (imagePaths) {
            res.status(200).json({
              // file:"http://127.0.0.1:3000/html/"+new_name+".html"
              path: '/uploadedpdf/' + ts + '/' + 'pdf.pdf',
              pdfid: ts

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


router.post("/pdfdetail", function (req, res) {
  // console.log(req.body.pdfid)
  const pdfid = req.body.pdfid;
  const dir = path.join(__basedir, '/uploadedpdf/uploadedpdf/') + pdfid;

  fs.readdir(dir, (err, files) => {
    // console.log(files.length);
    res.status(200).json({
      fileslength: files.length - 1,
    })
  });
})

// ----------------------------- get users's list ----------------------- // 


router.get("/userlist/:userId/:docId", function (req, res) {
  var userlist = [];
  var userdata = [];
  var count = 0;
  Document.find({ userid: req.params.userId, documentid: req.params.docId },
    'usertosign', function (err, users) {
      if (err) {
        res.status(400).json({
          data: err
        })
      } else {
        console.log(users)
        for (let i = 0; i < users.length; i++) {
          userlist.push({ id: users[i].usertosign });
        }
        console.log(userlist);
        for (let i = 0; i < userlist.length; i++) {
          Contact.findOne({ _id: userlist[i].id }, 'firstName lastName email', function (err, contact) {
            if (err) {
              res.status(400).json({
                data: err
              })
            } else {

              //  console.log(userlist)
              userdata.push({ _id: contact._id, firstName: contact.firstName, lastName: contact.lastName, email: contact.email })
              count++;
              if (count === userlist.length) {
                res.status(200).json({
                  data: userdata
                })
              }
            }
          })
        }
      }
    })
})

// -------------------------  get user detail ---------------------------- //

router.get("/userdetail/:userid", function (req, res) {
  Contact.findOne({ _id: req.params.userid }, 'firstName lastName email', function (err, user) {
    if (err) {
      res.status(400).json({
        msg: "user not found",
        data: err
      })
    } else {
      res.status(200).json({
        data: user
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
  // var document = new Document();
  // document.documentid = req.body.pdfid;
  // document.userid = req.body.userid;
  // document.documenthtml = req.body.html;
  // document.actionrequired = 'Pending';
  // document.expiration = req.body.expdate;
  // document.save(function(err,document) {
  //   if(err){
  //     res.status(400).json({
  //       message : err
  //     });
  //   } else {
  //    // console.log(document._id);
  //    Contact.update({docrefId: req.body.docid},{$set:{saveddocId: document._id}},function(err,update) {
  //      if(err) {
  //        res.status(400).json({
  //          message: err
  //        })
  //      } else {

  //       res.status(200).json({
  //                message: 'Success'
  //              })
  //      }
  //    })

  //   }

  // })
  // }
  //   })
  Document.update({ documentid: req.body.pdfid }, { $set: { documenthtml: req.body.html } }, { multi: true }, function (err, update) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      DocStatus.updateOne({ documentid: req.body.pdfid }, { $set: { documentstatus: 'Pending' } }, function (err, updatestatus) {
        if (err) {
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
})


//---------------------------- send document ------------------------- //


router.post('/senddocument', function (req, res) {

  var uemail, uphonenumber, uimage;
  User.findOne({ _id: req.body.userid }, 'phonenumber email image', function (err, userdetail) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      uemail = userdetail.email;
      uphonenumber = userdetail.phonenumber;
      uimage = userdetail.image;
    }

  })

  Document.update({ documentid: req.body.pdfid }, { $set: { documenthtml: req.body.html } }, { multi: true }, function (err, update) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {

      Document.findOne({ documentid: req.body.pdfid, priority: 1 }, 'usertosign', function (err, doc) {
        if (err) {
          res.status(400).json({
            message: err
          })
        } else {
          DocStatus.updateOne({ documentid: req.body.pdfid }, { $set: { documentstatus: 'Completed' } }, function (err, status) {
            if (err) {
              res.status(400).json({
                message: err
              })
            } else {
              Contact.findOne({ _id: doc.usertosign }, 'email firstName lastName', function (err, data) {
                var toEmailAddress = data.email;

                var mailAccountUser = 'signingrequest.ezeesteve@gmail.com'
                var mailAccountPassword = 'steve@098'
                var fromEmailAddress = 'signingrequest.ezeesteve@gmail.com'
                var transport = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: mailAccountUser,
                    pass: mailAccountPassword
                  }
                })
                if (uimage == 'none') {
                  var click = "<div>Image Not Avalible</div>";

                }
                else {
                  var imageurl = 'https://mybitrade.com:3001/images/' + req.body.userid + '/' + uimage;
                  var click = "<div><img src='" + imageurl + "' style='height:130px'/></div>";

                }
                var url = 'https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/' + doc.usertosign;

                var onlydate = new Date().toUTCString()
                var template = '<body><table width="100%" cellpadding="0" cellspacing="0">' +
                  ' <tbody><tr><td valign="top" align="center">' +
                  '<table width="90%" border="0" style="font-family:Myriad Pro;border:30px solid #858f03">' +
                  '<tbody> <tr><td valign="top"><table width="100%" height="40" border="0" cellpadding="0" cellspacing="0">' +
                  '  <tbody>  <tr><td height="3" colspan="2"></td> </tr><tr>' +
                  '  <td style="width:50%!important" align="left" valign="middle">' +
                  click + '</td>' +
                  '<td align="right" valign="top"><table border="0" width="100%" align="left" cellspacing="2" height="120">' +
                  '<tbody> <tr><td height="50" style="border:none!important">' +
                  '<div style="border:10px solid #b59848;width:295px;height:170px;float:right;margin:1.5% 3% 1% 0%">' +
                  '<div style="width:280px;height:145px;border:2px solid #b59848;margin:auto;margin-top:1%;font-family:Verdana,Geneva,sans-serif;font-size:14px;padding:15px 0px 0px 5px">' +
                  'This email was sent to you from:<br><br>United States<div>Mobile: <span>' + uphonenumber + '</span> </div>' +
                  '<div>Email ID:  <span><a>' + uemail + '</a></span>' +
                  '</div></div> </div>  </td></tr></tbody></table></td> </tr></tbody> </table> </td> </tr>' +
                  '<tr> <td colspan="2"> <table width="100%" cellpadding="2" cellspacing="2" border="0" style="background:#f1f1f1">' +
                  '<tbody><tr><td colspan="6"><table width="100%" border="0" cellspacing="0" cellpadding="0">' +
                  ' <tbody> <tr style="background:#858f03;height:40px">' +
                  '<td style="width:60%!important;font-size:28px;padding-left:10px;color:#fff" colspan="2" valign="middle">Signing Participant Invitation</td>' +
                  '<td style="width:40%!important;padding-right:10px;color:#fff" align="right" valign="middle">' +
                  '<strong>Date: </strong>&nbsp;<span tabindex="0"><span>' + onlydate + '</span></span>' +
                  '</td></tr> </tbody></table></td></tr><tr>' +
                  '<td valign="top" colspan="6" align="center" style="font-family:Myriad Pro;font-size:14px;padding:10px 4px 5px 4px;color:#383838;line-height:22px">' +
                  '<table width="99%" border="0" cellspacing="0" cellpadding="0"><tbody> <tr>' +
                  '<td valign="top" style="text-align:left;padding-left:4px;padding-right:4px">' +
                  '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
                  '<tbody> <tr> <td style="font-family:Myriad Pro;font-size:15px;padding-top:10px"><strong>Dear ' + data.firstName + ' ' + data.lastName + ',</strong></td>' +
                  ' </tr></tbody> </table></td></tr><tr>' +
                  '<td colspan="6" style="font-family:Myriad Pro;font-size:22px!important;padding:10px 4px 5px 4px">' +
                  'This email is an invitation to participate as a signing party in an EzeeSteve E-signature document si.gning<br>' +
                  '<strong><a href="' + url + '" target="_blank" >Click Here</a></strong>to view and sign the document in your web browser.' +
                  '</td></tr><tr><td colspan="6" style="font-family:Myriad Pro;font-size:15px;padding:10px 4px 0px 4px">After you sign you will receive an email that contains an electronic copy for your records.</td>' +
                  '</tr> </tbody></table>	</td></tr></tbody></table></td> </tr>' +
                  '<tr><td colspan="2"><img src="https://mybitrade.com/assets/img/ezee-logo.png" style="width:80px;height:auto;float:right;margin:10px">' +
                  '</td></tr></tbody> </table></td> </tr> </tbody> </table> </body>';
                var mail = {
                  from: fromEmailAddress,
                  to: toEmailAddress,
                  subject: "EzeeSteve Document Sign ",
                  html: template
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

    }
  })
})
// var document = new Document();
// document.documentid = req.body.pdfid;
// document.userid = req.body.userid;
// document.documenthtml = req.body.html;
// document.actionrequired = 'Completed';
// document.expiration = req.body.expdate;
// document.save(function(err,document) {
//   if(err){
//     res.status(400).json({
//       message : err
//     });
//   } else {
//    // console.log(document._id);
//    Contact.update({docrefId: req.body.docid},{$set:{saveddocId: document._id}},function(err,update) {
//      if(err) {
//        res.status(400).json({
//          message: err
//        })
//      } else {
//       Contact.findOne({docrefId: req.body.docid,priority : 1}, 'email',function(err,data) {
//         var toEmailAddress = data.email;
//         var mailAccountUser = 'work.jagveer@gmail.com'
//         var mailAccountPassword = 'jagveer@123'
//         var fromEmailAddress = 'work.jagveer@gmail.com'
//         var transport = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             user: mailAccountUser,
//             pass: mailAccountPassword
//           }
//         })
//         var mail = {
//           from: fromEmailAddress,
//           to: toEmailAddress,
//           subject: "EzeeSteve Document Sign ",
//           html: '<p>Click <a href="https://mybitrade.com:4200/newsign/' +  document._id + '">here</a></p>' 
//         }

//         transport.sendMail(mail, function (error, response) {
//           if (error) {
//             res.json({
//               success: error,
//               message: "Something went wrong.Please Try Again"
//             })
//           } else {
//            res.status(200).json({
//              message: 'Email Sent Successfully'
//            })
//           }

//           transport.close();
//         });
//       })
//      }
//    })

//   }

// })



// --------------------------- get document -------------------------//\

router.get('/getdocument/:userid/:documentid', function (req, res) {

  Document.findOne({ _id: req.params.documentid }, 'documenthtml', function (err, dochtml) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      res.status(200).json({
        data: dochtml
      })
    }

  })
})

// ----------------------- get document count ------------------------- //

router.get('/documentcount/:userid', function (req, res) {

  Document.find({ userid: req.params.userid }).count(function (err, count) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      var documentcount = count + "";
      while (documentcount.length < 8) documentcount = "0" + documentcount;
      res.status(200).json({
        data: documentcount
      })
    }

  })

})

// ----------------------- check user is eligible to open doc or not ------------------------- //

router.get('/checkeligibility/:useremail/:docid/:userid', function (req, res) {

  Contact.findOne({ userId: req.params.userid, email: req.params.useremail }, function (err, user) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      if (!user) {
        res.status(400).json({
          data: 0                  // 0 - user is  not eligible
        })


      } else {
        Document.find({ usertosign: user._id, _id: req.params.docid }).count(function (err, count) {
          if (err) {
            res.status(400).json({
              message: err
            })
          } else {
            if (count > 0) {
              res.status(200).json({
                data: 1                   // 1 - user is eligible
              })
            } else {
              res.status(200).json({
                data: 0                   // 0 - user is  not eligible
              })
            }
          }

        })
      }
    }
  })


})

//--------------------------- add new participant --------------------- //

router.post('/addnewparticipant', function (req, res) {
  const contact = new Contact();
  contact.userId = req.body.userId;
  contact.firstName = req.body.firstName;
  contact.lastName = req.body.lastName;
  contact.email = req.body.email;
  contact.address = req.body.address;
  contact.subject = req.body.subject;
  contact.message = req.body.message;
  // contact.docrefId = req.body.docId;
  // contact.priority = req.body.priority;
  // contact.type = req.body.type;
  Contact.findOne({ email: req.body.email, userId: req.body.userId }).count(function (err, count) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      if (count > 0) {
        Contact.findOne({ email: req.body.email, userId: req.body.userId }, function (err, user) {
          if (user) {
            res.status(200).json({
              message: 2,
              id: user._id                  // 2 = user already in your contact list
            })
          }
          else {
            res.status(400).json({
              message: err
            });
          }

        });

      } else {
        contact.save(function (err, contact) {
          if (err) {
            res.status(400).json({
              message: err
            });
          } else {
            res.status(200).json({
              id: contact._id,
              message: 1               // 1 = contact created successfully
            })
          }
        })
      }
    }
  })
})


// ------------------------------ get user contacts ----------------------//

router.get('/mycontacts/:userid', function (req, res) {
  Contact.find({ userId: req.params.userid }, 'email firstName lastName', function (err, contacts) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      res.status(200).json({
        data: contacts
      })
    }
  })
})

//------------------------------ get user contact detail ------------------ //

router.get('/contactdetail/:id', function (req, res) {
  Contact.find({ _id: req.params.id }, 'email firstName lastName type', function (err, contactdetail) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      res.status(200).json({
        data: contactdetail
      })
    }
  })
})

// ------------------------ add users to document ----------------------------------------//

router.post('/addusertodocument', function (req, res) {
  // var usertosign  = 
  //console.log(req.body.usertosign.length)
  var success = [];
  var count = 0;
  var docstatus = new DocStatus();
  docstatus.documentid = req.body.pdfid;
  docstatus.userid = req.body.userid;
  docstatus.save(function (err, status) {
    if (err) {
      res.status(400).json({
        message: err
      });
    } else {
      for (let i = 0; i < req.body.usertosign.length; i++) {
        //console.log(req.body.usertosign[i].id)
        var document = new Document();
        document.documentid = req.body.pdfid;
        document.userid = req.body.userid;
        document.usertosign = req.body.usertosign[i].id;
        document.priority = i + 1;
        document.actionrequired = 'Not Signed';
        document.expiration = req.body.expdate;
        document.save(function (err, document) {
          if (err) {
            res.status(400).json({
              message: err
            });
          } else {
            success.push('success');
            count++;
            if (count === req.body.usertosign.length) {
              res.status(200).json({
                message: 'success'
              });
            }
          }
        })
      }
    }
  })
})



router.post('/updatedoc', function (req, res) {
  console.log(req.body.reciptemail)
  var uemail, uphonenumber, uimage;
  const ip = req.clientIp;
  console.log(ip);
 
 
  // var res = str.replace("::ffff:", "");
  // var ip="res";
  // console.log(ip);
  User.findOne({ _id: req.body.userid }, 'phonenumber email image', function (err, userdetail) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      uemail = userdetail.email;
      uphonenumber = userdetail.phonenumber;
      uimage = userdetail.image;
    }

  })
  Document.findOne({ _id: req.body.docid }, 'documentid', function (err, doc) {
    if (err) {
      res.status(400).json({
        message: err,
        error: "here5"
      })
    } else {
      var did=doc.documentid;
      Document.updateOne({ _id: req.body.docid, userid: req.body.userid }, { $set: { actionrequired: 'Signed' } }, function (err, status) {
        if (err) {
          res.status(400).json({
            message: err,
            error: "here4"
          })
        } else {
          Document.update({ documentid: doc.documentid }, { $set: { documenthtml: req.body.html, signedTime: Date() } }, { multi: true }, function (err, update) {
            if (err) {
              res.status(400).json({
                message: err,
                error: "here3"
              })
            } else {
              Document.findOne({ documentid: doc.documentid, user: { $ne: req.body.userid }, actionrequired: 'Not Signed' }, 'usertosign', function (err, user) {
                if (err) {
                  res.status(400).json({
                    message: err,
                    error: "here2"
                  })
                } else {
                  if (!user) {
                    res.status(200).json({
                      message: 'success'
                    })
                  } else {
                    Contact.findOne({ _id: user.usertosign }, 'email', function (err, contact) {
                      if (err) {
                        res.status(400).json({
                          message: err,
                          error: "here1"
                        })
                      } else {
                        console.log(contact.email)
                        var toEmailAddress = contact.email;
                        var mailAccountUser = 'signingreceipt.ezeesteve@gmail.com'
                        var mailAccountPassword = 'steve@098'
                        var fromEmailAddress = 'signingreceipt.ezeesteve@gmail.com'
                        var transport = nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                            user: mailAccountUser,
                            pass: mailAccountPassword
                          }
                        })

                        if (uimage == 'none') {
                          var click = "<div>Image Not Avalible</div>";

                        }
                        else {
                          var imageurl = 'https://mybitrade.com:3001/images/' + req.body.userid + '/' + uimage;
                          var click = "<div><img src='" + imageurl + "' style='height:130px'/></div>";

                        }
                        var url = 'https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/' + user.usertosign;

                        var onlydate = new Date().toUTCString()
                        //   var click= '<p>Click <a href="https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/'+user.usertosign+'">here</a></p>';
                        var template = '<body><table width="100%" cellpadding="0" cellspacing="0">' +
                          ' <tbody><tr><td valign="top" align="center">' +
                          '<table width="90%" border="0" style="font-family:Myriad Pro;border:30px solid #858f03">' +
                          '<tbody> <tr><td valign="top"><table width="100%" height="40" border="0" cellpadding="0" cellspacing="0">' +
                          '  <tbody>  <tr><td height="3" colspan="2"></td> </tr><tr>' +
                          '  <td style="width:50%!important" align="left" valign="middle">' +
                          click + '</td>' +
                          '<td align="right" valign="top"><table border="0" width="100%" align="left" cellspacing="2" height="120">' +
                          '<tbody> <tr><td height="50" style="border:none!important">' +
                          '<div style="border:10px solid #b59848;width:295px;height:170px;float:right;margin:1.5% 3% 1% 0%">' +
                          '<div style="width:280px;height:145px;border:2px solid #b59848;margin:auto;margin-top:1%;font-family:Verdana,Geneva,sans-serif;font-size:14px;padding:15px 0px 0px 5px">' +
                          'This email was sent to you from:<br><br>United States<div>Mobile: <span>' + uphonenumber + '</span> </div>' +
                          '<div>Email ID:  <span><a>' + uemail + '</a></span>' +
                          '</div></div> </div>  </td></tr></tbody></table></td> </tr></tbody> </table> </td> </tr>' +
                          '<tr> <td colspan="2"> <table width="100%" cellpadding="2" cellspacing="2" border="0" style="background:#f1f1f1">' +
                          '<tbody><tr><td colspan="6"><table width="100%" border="0" cellspacing="0" cellpadding="0">' +
                          ' <tbody> <tr style="background:#858f03;height:40px">' +
                          '<td style="width:60%!important;font-size:28px;padding-left:10px;color:#fff" colspan="2" valign="middle">Signing Participant Invitation</td>' +
                          '<td style="width:40%!important;padding-right:10px;color:#fff" align="right" valign="middle">' +
                          '<strong>Date: </strong>&nbsp;<span tabindex="0"><span>' + onlydate + '</span></span>' +
                          '</td></tr> </tbody></table></td></tr><tr>' +
                          '<td valign="top" colspan="6" align="center" style="font-family:Myriad Pro;font-size:14px;padding:10px 4px 5px 4px;color:#383838;line-height:22px">' +
                          '<table width="99%" border="0" cellspacing="0" cellpadding="0"><tbody> <tr>' +
                          '<td valign="top" style="text-align:left;padding-left:4px;padding-right:4px">' +
                          '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
                          '<tbody> <tr> <td style="font-family:Myriad Pro;font-size:15px;padding-top:10px"><strong>Dear ' + contact.firstName + ' ' + contact.lastName + ',</strong></td>' +
                          ' </tr></tbody> </table></td></tr><tr>' +
                          '<td colspan="6" style="font-family:Myriad Pro;font-size:22px!important;padding:10px 4px 5px 4px">' +
                          'This email is an invitation to participate as a signing party in an EzeeSteve E-signature document si.gning<br>' +
                          '<strong><a href="' + url + '" target="_blank" >Click Here</a></strong>to view and sign the document in your web browser.' +
                          '</td></tr><tr><td colspan="6" style="font-family:Myriad Pro;font-size:15px;padding:10px 4px 0px 4px">After you sign you will receive an email that contains an electronic copy for your records.</td>' +
                          '</tr> </tbody></table>	</td></tr></tbody></table></td> </tr>' +
                          '<tr><td colspan="2"><img src="https://mybitrade.com/assets/img/ezee-logo.png" style="width:80px;height:auto;float:right;margin:10px">' +
                          '</td></tr></tbody> </table></td> </tr> </tbody> </table> </body>';
                        var mail = {
                          from: fromEmailAddress,
                          to: toEmailAddress,
                          subject: "EzeeSteve Document Sign ",
                          html: template
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
                        // ================================================
                        // sucess mail userdetail.email
                        // ========================================================
                        console.log("here",uemail)
                        
                        var uemail = uemail;
                        var mailAccountUser = 'signingreceipt..ezeesteve@gmail.com'
                        var mailAccountPassword = 'steve@098'
                        var fromEmailAddress = 'signingreceipt..ezeesteve@gmail.com'
                        var transport = nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                            user: mailAccountUser,
                            pass: mailAccountPassword
                          }
                        })

                        if (uimage == 'none') {
                          var click = "<div>Image Not Avalible</div>";

                        }
                        else {
                          var imageurl = 'https://mybitrade.com:3001/images/' + req.body.userid + '/' + uimage;
                          var click = "<div><img src='" + imageurl + "' style='height:130px'/></div>";

                        }
                        var url = 'https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/' + user.usertosign;

                        var onlydate = new Date().toUTCString()
                        //   var click= '<p>Click <a href="https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/'+user.usertosign+'">here</a></p>';
                        var template = '<body><table width="100%" cellpadding="0" cellspacing="0">'+
                        '<tbody><tr><td valign="top" class="m_7195789729905264023heading" align="center">'+
                      ' <table width="90%" border="0" style="font-family:Myriad Pro;border:30px solid #858f03">'+
                       '<tbody><tr><td valign="top" class="m_7195789729905264023heading">'+
                       '<table width="100%" height="40" border="0" cellpadding="0" cellspacing="0">'+
                       '<tbody> <tr><td height="3" colspan="2"></td></tr>'+
                       '<tr><td style="width:50%!important" align="left" valign="middle">'+
                       '<img src="http://www.ezeesteve.com/images/signature.png"style="width:30%" class="CToWUd">'+
                       '</td><td align="right" valign="top">'+
                        '<table border="0" width="100%" align="left" cellspacing="2" height="120">'+
                         '<tbody><tr><td height="50" style="border:none!important"></td>'+
                         '</tr></tbody></table> </td></tr></tbody></table></td></tr> <tr>'+
                        '<td colspan="2"><table width="100%" cellpadding="2" cellspacing="2" border="0" style="background:#f1f1f1">'+
                    
                       '<tbody><tr><td colspan="6"><table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                       '<tbody><tr style="background:#858f03;height:40px"><td style="width:60%!important;font-size:28px;padding-left:10px;color:#fff" colspan="2" valign="middle">Sender Signature Receipt</td>'+
                      '<td style="width:40%!important;padding-right:10px;color:#fff" align="right" valign="middle">'+
                      '<strong>Date: </strong>&nbsp;<span class="aBn" data-term="goog_305617764"tabindex="0">'+
                        '<span class="aQJ">'+onlydate+'</span></span></td></tr></tbody> </table></td></tr><tr>'+
                       ' <td valign="top" colspan="2" align="center" style="font-family:Myriad Pro;font-size:14px;padding:10px 4px 5px 4px;color:#383838;line-height:22px">'+
                      '<table width="99%" border="0" cellspacing="0" cellpadding="0">'+
                       '<tbody><tr> <td valign="top" style="text-align:left;padding-left:4px;padding-right:4px">'+
                        '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr>'+
                        '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;text-align:justify" colspan="3">This receipt contains verifiable proof of your'+
                        'EzeeSteve transaction. The holder of thisreceipt has proof of delivery, message and official time of signature.</td>'+
                        '</tr>  <tr><td colspan="3"><strong>Message Statistics</strong> </td></tr><tr>'+
                        '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px;width:30%">'+
                        ' <strong>Email ID</strong> </td><td style="width:5%">&nbsp;</td>'+
                        '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                        '<a href="mailto:'+uemail+'"target="_blank">'+uemail+'</a> </td>'+
                        '</tr>  <tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                        '<strong>File Name</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+did+'.pdf</td>'+
                       '</tr><tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                        '<strong>Signed By</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                       '<a href="mailto:'+req.body.reciptemail+'"target="_blank">'+req.body.reciptemail+'</a></td></tr><tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                       '<strong>Signed Date</strong> </td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+onlydate+'</td>'+
                       '</tr> <tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                       '<strong>IP</strong></td> <td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+ip+'</td>'+
                      '</tr> <tr> <td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                     '<strong>Download</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">Download signed document please'+
                     '</td></tr><tr><td colspan="3">&nbsp;</td></tr></tbody></table></td></tr></tbody></table> </td></tr></tbody></table></td>'+
                    '</tr> <tr> </tr> <tr> <td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px"'+
                    'colspan="3"><strong>Thanks &amp; Regards</strong></td> </tr><tr>'+
                    '<td style="font-family:Myriad Pro;font-size:15px;padding:10px 4px 5px 8px;line-height:24px" colspan="2">j <br><div>'+
                    '  <strong>Email ID: </strong>'+
                    ' <a href="mailto:'+uemail+'" target="_blank">'+uemail+'</a></div></td></tr><tr>'+
                    ' <td colspan="2"><img src="http://www.ezeesteve.com/images/ezee.png"style="width:80px;height:25px;float:right;margin:10px" class="CToWUd">'+
                    '</td> </tr></tbody></table></td></tr></tbody></table> </body>';
                        var mail = {
                          from: fromEmailAddress,
                          to: uemail,
                          subject: "EzeeSteve Document Sign ",
                          html: template
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

                        User.findOne({_id:req.body.userid},function(err,mainuser){
                          if(err) {
                            res.status(400).json({
                              message: err
                            })
                          } else {
                            var toEmailAddress = mainuser.email;
                            var mailAccountUser = 'signingrequest.ezeesteve@gmail.com'
                            var mailAccountPassword = 'steve@098'
                            var fromEmailAddress = 'signingrequest.ezeesteve@gmail.com'
                            var transport = nodemailer.createTransport({
                              service: 'gmail',
                              auth: {
                                user: mailAccountUser,
                                pass: mailAccountPassword
                              }
                            })
                          
                            if (uimage == 'none') {
                              var click = "<div>Image Not Avalible</div>";
                          
                            }
                            else {
                              var imageurl = 'https://mybitrade.com:3001/images/' + req.body.userid + '/' + uimage;
                              var click = "<div><img src='" + imageurl + "' style='height:130px'/></div>";
                          
                            }
                            var url = 'https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/' + user.usertosign;
                          
                            var onlydate = new Date().toUTCString()
                            //   var click= '<p>Click <a href="https://mybitrade.com/newsign/' + doc._id + '/' + req.body.userid + '/'+user.usertosign+'">here</a></p>';
                            var template = '<body><table width="100%" cellpadding="0" cellspacing="0">'+
                            '<tbody><tr><td valign="top" class="m_7195789729905264023heading" align="center">'+
                          ' <table width="90%" border="0" style="font-family:Myriad Pro;border:30px solid #858f03">'+
                           '<tbody><tr><td valign="top" class="m_7195789729905264023heading">'+
                           '<table width="100%" height="40" border="0" cellpadding="0" cellspacing="0">'+
                           '<tbody> <tr><td height="3" colspan="2"></td></tr>'+
                           '<tr><td style="width:50%!important" align="left" valign="middle">'+
                           '<img src="http://www.ezeesteve.com/images/signature.png"style="width:30%" class="CToWUd">'+
                           '</td><td align="right" valign="top">'+
                            '<table border="0" width="100%" align="left" cellspacing="2" height="120">'+
                             '<tbody><tr><td height="50" style="border:none!important"></td>'+
                             '</tr></tbody></table> </td></tr></tbody></table></td></tr> <tr>'+
                            '<td colspan="2"><table width="100%" cellpadding="2" cellspacing="2" border="0" style="background:#f1f1f1">'+
                          
                           '<tbody><tr><td colspan="6"><table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                           '<tbody><tr style="background:#858f03;height:40px"><td style="width:60%!important;font-size:28px;padding-left:10px;color:#fff" colspan="2" valign="middle">Sender Signature Receipt</td>'+
                          '<td style="width:40%!important;padding-right:10px;color:#fff" align="right" valign="middle">'+
                          '<strong>Date: </strong>&nbsp;<span class="aBn" data-term="goog_305617764"tabindex="0">'+
                            '<span class="aQJ">'+onlydate+'</span></span></td></tr></tbody> </table></td></tr><tr>'+
                           ' <td valign="top" colspan="2" align="center" style="font-family:Myriad Pro;font-size:14px;padding:10px 4px 5px 4px;color:#383838;line-height:22px">'+
                          '<table width="99%" border="0" cellspacing="0" cellpadding="0">'+
                           '<tbody><tr> <td valign="top" style="text-align:left;padding-left:4px;padding-right:4px">'+
                            '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr>'+
                            '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;text-align:justify" colspan="3">This receipt contains verifiable proof of your'+
                            'EzeeSteve transaction. The holder of thisreceipt has proof of delivery, message and official time of signature.</td>'+
                            '</tr>  <tr><td colspan="3"><strong>Message Statistics</strong> </td></tr><tr>'+
                            '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px;width:30%">'+
                            ' <strong>Email ID</strong> </td><td style="width:5%">&nbsp;</td>'+
                            '<td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                            '<a href="mailto:'+toEmailAddress+'"target="_blank">'+toEmailAddress+'</a> </td>'+
                            '</tr>  <tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                            '<strong>File Name</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+did+'.pdf</td>'+
                           '</tr><tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                            '<strong>Signed By</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                           '<a href="mailto:'+toEmailAddress+'"target="_blank">'+toEmailAddress+'</a></td></tr><tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                           '<strong>Signed Date</strong> </td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+onlydate+'</td>'+
                           '</tr> <tr><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                           '<strong>IP</strong></td> <td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+ip+'</td>'+
                          '</tr> <tr> <td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">'+
                          '<strong>Download</strong></td><td>&nbsp;</td><td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px">Download signed document please'+
                          '</td></tr><tr><td colspan="3">&nbsp;</td></tr></tbody></table></td></tr></tbody></table> </td></tr></tbody></table></td>'+
                          '</tr> <tr> </tr> <tr> <td style="font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;font-weight:inherit;padding-top:5px;margin-left:5px;margin-right:5px"'+
                          'colspan="3"><strong>Thanks &amp; Regards</strong></td> </tr><tr>'+
                          '<td style="font-family:Myriad Pro;font-size:15px;padding:10px 4px 5px 8px;line-height:24px" colspan="2">j <br><div>'+
                          '  <strong>Email ID: </strong>'+
                          ' <a href="mailto:'+toEmailAddress+'" target="_blank">'+toEmailAddress+'</a></div></td></tr><tr>'+
                          ' <td colspan="2"><img src="http://www.ezeesteve.com/images/ezee.png"style="width:80px;height:25px;float:right;margin:10px" class="CToWUd">'+
                          '</td> </tr></tbody></table></td></tr></tbody></table> </body>';
                            var mail = {
                              from: fromEmailAddress,
                              to: toEmailAddress,
                              subject: "EzeeSteve Document Sign ",
                              html: template
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
                      
                        })
                        // ------------------------------------------------------------------------------------------------------------
                        // recipt
                        // ----------------------------------------------------------------------------------
                        console.log("here",req.body.reciptemail)
                        
                     
                      }

                    })


                  }
                }
              })
            }
          })
        }
      })
    }
  })
})
// ===============================================================================================
router.get('/confirmuser/:userid', function (req, res) {
  console.log(req.params)
  var userid = req.params.userid;
  User.findOneAndUpdate(
    { _id: userid },
    { $set: { status: "verified" } }, function (err, suc) {
      if (err) {
        res.status(400).json({
          message: err,

        })
      }
      else {
        console.log(suc)
        res.status(200).json({
          message: "verified sucessfully",
          data: suc
        })
      }
    })
})
// =================================================================================================

router.get('/documentdetail/:documentid', function (req, res) {
 // console.log('sad')
  // console.log(req.params.documentid)
  var detailed = [];
  var pdfdata = '';
  var count = 0;
  Document.find({ documentid: req.params.documentid }, function (err, data) {
    if (err) {
      res.status(400).json({
        message: err,
        mssg: "assssqdwe"
      })
    }
    else {
      pdfdata = data;
      var len = data.length;
      for (let i = 0; i < data.length; i++) {
        User.find({ _id: data[i].userid }, function (err, user) {
          if (err) {
            res.status(400).json({
              message: err,
              msg: "df"
            })
          }
          else {
            var userdata = user;

            Contact.find({ _id: pdfdata[i].usertosign }, function (err, result) {
              if (err) {
                res.status(400).json({
                  message: err,
                  msg: "dfsd"
                })
              }
              else {
                console.log("length-", result.length);
                console.log(i)
                for (let j = 0; j < result.length; j++) {
                  detailed.push({
                    userid: result[j]._id,
                    firstName: result[j].firstName,
                    lastName: result[j].lastName,
                    email: result[j].email,
                    documentid: pdfdata[i].documentid,
                    actionrequired: pdfdata[i].actionrequired,
                    expiration: pdfdata[i].expiration,
                    from: userdata[j].email,
                    image: pdfdata[i].userimage,
                    uservideo: pdfdata[i].uservideo

                  })
                }
                count++;
                // data[i].push({userid:result._id,name:result.firstName+" "+result.lastName})
                // if (result != '') {

                //   detailed.push({
                //     userid: result[i]._id,
                //     firstName: result[i].firstName,
                //     lastName: result[i].lastName,
                //     email: result[i].email,
                //     documentid: pdfdata[i].documentid,
                //     actionrequired: pdfdata[i].actionrequired,
                //     expiration: pdfdata[i].expiration,
                //     from: userdata[i].email


                //   })

                //   // console.log("------------------"+ JSON.stringify(detailed) +"-------------------")

                // }
              }
              if (len == count) {
                res.status(200).json({
                  data: detailed
                })
              }
            })

          }
        })
      }
    }
  })
})
// mycompleteddocuments

router.get('/mycompleteddocuments/:userid', function (req, res) {
  var documents = [];
  var count = 0;
  var mydocuments = [];
  var alldocs = [];
  var uni_docs = [];
  var detailed = [];
  var docdata = [];
  var test = [];

  var doc_id = '';
  var newcount = 0;

  Document.find({ userid: req.params.userid, actionrequired: 'Signed' }, 'signedTime documentid userid usertosign ',
    function (err, doc) {
      if (err) {
        res.status(400).json({
          message: err
        })
      } else {
        console.log(doc.length);
        //check on time is pending
        alldocs = doc;
        var length = doc.length;
        for (let i = 0; i < doc.length; i++) {

          if (uni_docs.indexOf(doc[i].documentid) == '-1') {
            // console.log('if')
            uni_docs.push(doc[i].documentid);
            docdata.push(doc[i]);

            count++;
          }
          else {
            // console.log('else')
            count++;

          }
          if (count == length) {

            console.log(docdata)
            res.status('200').json({
              msg: "Data Loaded Sucessfully",
              data: docdata
            })
          }



        }



      }
    })

})

// ---------------------------------------------------------------------------------------------------

router.get('/mydocuments/:userid', function (req, res) {
  var documents = [];
  var count = 0;
  var mydocuments = [];
  DocStatus.find({ userid: req.params.userid, documentstatus: { $ne: 'Initialize' } }, 'documentid documentstatus', function (err, doc) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      //     console.log(doc[0].documentid)
      //  documents.push({id:doc.documentid});
      //  console.log(documents);
      for (let i = 0; i < doc.length; i++) {
        documents.push({ id: doc[i].documentid, documentstatus: doc[i].documentstatus })
      }
      for (let i = 0; i < documents.length; i++) {
        console.log(documents.length);
        console.log(documents[i].id)
        Document.findOne({ documentid: documents[i].id, actionrequired: 'Not Signed' }, 'dateadded', function (err, docs) {
          if (err) {
            res.status(400).json({
              message: err
            })
          } else {
            if(!docs) {
              count++;
            } else {
          //  console.log(docs)
            var date = docs.dateadded.toDateString().substr(4, 12);
            var time = docs.dateadded.getHours() + ':' + docs.dateadded.getMinutes() + ':' + docs.dateadded.getSeconds();
            var documentstatus = documents[i].documentstatus;
            if (documentstatus == 'Pending') {
              documentstatus = 'Send'
            }
            else {
              documentstatus = 'Sign'
            }
            mydocuments.push({ id: docs._id, documentname: documents[i].id, date: date, time: time, documentstatus: documentstatus });
            count++;
            //  console.log(mydocuments);
            if (count === documents.length) {
              res.status(200).json({
                data: mydocuments
              })
            }
          }
        }
        })
      }
    }
  })

})


//-------------------------------- update user signed image ------------------------------ //

router.post('/signeduserimage', function (req, res) {

  //var str = req.body.imagename;
  var url = req.body.imagename.split('/');;
  // console.log( url[ url.length - 1 ] ); // 2
  // console.log( url[ url.length - 2 ] + '/' + url[ url.length - 1 ]); 
  Document.findOne({ _id: req.body.docid, usertosign: req.body.userid }, function (err, doc) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      var imagename = url[url.length - 2] + '/' + url[url.length - 1] + '.jpg';
      Document.updateOne({ _id: req.body.docid, usertosign: req.body.userid }, { $set: { userimage: imagename } }, function (err, result) {
        if (err) {
          res.status('400').json({
            message: err
          })
        }
        else {
          res.status(200).json({
            message: 'Success'
          })
        }
        //}
      })
    }
  })
})

module.exports = router;
