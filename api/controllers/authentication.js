var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var buffer = require('buffer');
var fs = require('fs');
var path = require('path');
var base64Img = require('base64-img');
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {

  // if(!req.body.name || !req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }
  var ts = new Date().getTime();
  var user = new User();
  user.name = req.body.fname+" "+req.body.lname;
  user.email = req.body.email;
  user.cpassword = req.body.cpassword;
  user.phonenumber = req.body.phonenumber;
  
  user.image = 'image_'+ts+'.jpg';
console.log(req.body)
  user.setPassword(req.body.password);

  user.save(function(err,profile) {
    if(err){
      console.log(err);
      res.status(400);
      res.json({
        "err" : err
      });
    }
    else{
      console.log('userid-'+profile.id)
      var dir =path.join(__basedir,'/images/images/')+profile.id;
      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        base64Img.img(req.body.image, dir, 'image_'+ts, function(err, filepath) {
          if(err) 
          {
            console.log(err)
            res.send(err)
          }
        var token;
        token = user.generateJwt();
        var image=__basedir+'/images/images/'+profile.id+'/'+'image_'+ts;
        res.status(200);
        res.json({
          "token" : token,
          "image":image,
          "id":profile.id


        });
      });
        // fs.mkdirSync(path.join(__basedir,'/images/images/'+profile.id), 777, function(err,created){
        //     if(err){
        //         console.log(err);
        //         // echo the result back
        //         //response.send("ERROR! Can't make the directory! \n");
        //     }
        //     else {
        //       console.log('reached')
        //       base64Img.img(req.body.image, path.join(__basedir,'/images/images/5ab9e0a4122f0c533011c834/'), 'image_'+ts, function(err, filepath) {
        //           if(err) 
        //           {
        //             console.log(err)
        //             res.send(err)
        //           }
        //         var token;
        //         token = user.generateJwt();
        //         res.status(200);
        //         res.json({
        //           "token" : token
        //         });
        //       });
        //     }
        // });
    }
    }
   
  
})

};

module.exports.login = function(req, res) {

  // if(!req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};