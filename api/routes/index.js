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
var PDFImage = require("pdf-image").PDFImage;
var createHTML = require('create-html');


router.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));   // { extended: true} to parse everything.if false it will parse only String
router.use(bodyParser.json({ limit: '50mb' }));

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
  console.log(global.appRoot)
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

          var pdfImage = new PDFImage(path.join(__basedir, '/uploadedpdf/uploadedpdf/') + ts + '/' + 'pdf.pdf');
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
  Document.find({ userid: req.params.userId, documentid: req.params.docId }, 'usertosign', function (err, users) {
    if (err) {
      res.status(400).json({
        data: err
      })
    } else {
      //  console.log(users)
      for (let i = 0; i < users.length; i++) {
        userlist.push({ id: users[i].usertosign });
      }
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
              Contact.findOne({ _id: doc.usertosign }, 'email', function (err, data) {
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
                  html: '<p>Click <a href="https://mybitrade.com/signpdf/' + doc._id + '/' + req.body.userid + '/' + doc.usertosign +'">here</a></p>'
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
//           html: '<p>Click <a href="https://mybitrade.com:4200/signpdf/' +  document._id + '">here</a></p>' 
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
        res.status(200).json({
          message: 2                    // 2 = user already in your contact list
        })
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
  Document.findOne({ _id: req.body.docid }, 'documentid', function (err, doc) {
    if (err) {
      res.status(400).json({
        message: err
      })
    } else {
      Document.updateOne({ _id: req.body.docid, userid: req.body.userid }, { $set: { actionrequired: 'Signed' } }, function (err, status) {
        if (err) {
          res.status(400).json({
            message: err
          })
        } else {
          Document.update({ documentid: doc.documentid }, { $set: { documenthtml: req.body.html, signedTime: Date.now } }, { multi: true }, function (err, update) {
            if (err) {
              res.status(400).json({
                message: err
              })
            } else {
              Document.findOne({ documentid: doc.documentid, user: { $ne: req.body.userid }, actionrequired: 'Not Signed' }, 'usertosign', function (err, user) {
                if (err) {
                  res.status(400).json({
                    message: err
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
                          message: err
                        })
                      } else {
                        var toEmailAddress = contact.email;
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
                          html: '<p>Click <a href="https://mybitrade.com/signpdf/' + user._id + '/' + req.body.userid + '/' + user.usertosign + '">here</a></p>'
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


router.get('/documentdetail/:documentid', function (req, res) {
  console.log('sad')
  // console.log(req.params.documentid)
  var detailed = [];
  var pdfdata = '';
  var count =0;
  Document.find({ _id: req.params.documentid }, function (err, data) {
    if (err) {
      res.status(400).json({
        message: err,
        mssg:"assssqdwe"
      })
    }
    else {
      pdfdata = data;
      var len =data.length;
      for (let i = 0; i < data.length; i++) {
        User.find({ _id: data[i].userid }, function (err, user) {
          if (err) {
            res.status(400).json({
              message: err,
              msg:"df"
            })
          }
          else {
            var userdata = user;

            Contact.find({ _id: pdfdata[i].usertosign }, function (err, result) {
              if (err) {
                res.status(400).json({
                  message: err,
                  msg:"dfsd"
                })
              }
              else {
                console.log("length-",result.length);
                console.log(i)
                for(let j=0;j< result.length; j++){
                  detailed.push({
                    userid: result[j]._id,
                    firstName: result[j].firstName,
                    lastName: result[j].lastName,
                    email: result[j].email,
                    documentid: pdfdata[j].documentid,
                    actionrequired: pdfdata[j].actionrequired,
                    expiration: pdfdata[j].expiration,
                    from: userdata[j].email


                  })
                }
                count ++;
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
              if(len == count){res.status(200).json({
                data: detailed
              })}
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
            console.log(docs)
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
        })
      }
    }
  })

})

//-------------------------------- update user signed image ------------------------------ //

router.post('/signeduserimage', function (req, res) {
Document.findOne({_id:req.body.docid,usertosign:req.body.userid},function(err,doc){
  if(err) {
    res.status(400).json({
      message:err
    })
  } else {
    var imagename = req.body.imagename+'.jpg';
    Document.updateOne({_id:req.body.docid,usertosign:req.body.userid},{$set:{userimage:imagename}}, function (err, result) {
      if (err) {
        res.status('400').json({
          message:err
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
