import { Component } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../authentication.service';
import { Router } from '@angular/router';
import { WebCamComponent } from 'ack-angular-webcam';
import { WebcamImage } from 'ngx-webcam';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { RequestOptions } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { Headers } from '@angular/http'
// import { renderer2 } from '@angular/core';
@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  credentials: TokenPayload = {
    email: '',
    name: '',
    password: '',
    image: '',
    imag: '',
    phonenumber: '',
    cpassword: '',
    lname: '',
    fname: ''
  };
  public loading = false;
  public showWebcam = false;
  public error = null;
  public phoneerror = null;
  public passworderror = null;
  public cpassworderror = null;
  public mailerror = null;
  public fnameerror = null;
  public lnameerror = null;
  public imageerror = null;
  public Camera = null;
  public webcamImage: WebcamImage = null;
  public hideimg = null;
  public faceresponse :any;
  public duplicatedata:any;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public triggerSnapshot(): void {
    this.trigger.next();
    this.Camera = null;
  }
  public toggleWebcam(): void {
    this.Camera = "true";
    console.log("im");
    this.showWebcam = !this.showWebcam;
    if (this.webcamImage) {
      this.webcamImage = null;
    }
  }
  public handleImage(webcamImage: WebcamImage): void {
    // console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    // console.log(JSON.stringify(webcamImage));
    this.credentials.image = webcamImage.imageAsDataUrl;
    this.credentials.imag = "image";
    this.hideimg = "hide"
    this.showWebcam = false;
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  constructor(private auth: AuthenticationService, private router: Router, private http: HttpClient) { }
  checkmail() {
    // const element = this.credentials.selectRootElement('#input1');

    // setTimeout(() => element.focus(), 0);
    this.mailerror = '';
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    //console.log( regex.test(this.credentials.email));
    if (regex.test(this.credentials.email)) {
      this.mailerror = null;
    }
    else {

      this.mailerror = "Please enter a valid email";
      let element: HTMLElement = document.getElementById('email') as HTMLElement;
      element.focus();
    }
  }
  lname() {
    var empty = this.credentials.lname.length;
    if (empty < 1) {
      this.lnameerror = "Please enter the lastname";
      let element: HTMLElement = document.getElementById('lname') as HTMLElement;
      element.focus();
    }
    else {
      this.lnameerror = null
    }
  }
  fname() {
    var empty = this.credentials.fname.length;
    if (empty < 1) {
      this.fnameerror = "Please enter the Fastname";
      let element: HTMLElement = document.getElementById('fname') as HTMLElement;
      element.focus();
    }
    else {
      this.fnameerror = null
    }
  }
  password() {
    var length = this.credentials.password.length
    if (length < 8) {
      this.passworderror = "Please enter minimun 8 digit Password";
      let element: HTMLElement = document.getElementById('password') as HTMLElement;
      element.focus();
    }
    else {
      this.passworderror = null
    }
  }
  cpassword() {
    if (this.credentials.password != this.credentials.cpassword) {
      this.cpassworderror = "Password and Confirm password Donot match"
      let element: HTMLElement = document.getElementById('cpassword') as HTMLElement;
      element.focus();
    } else {
      this.cpassworderror = null
    }
  }
  number() {
    var length = this.credentials.phonenumber.length
    if (length < 10) {
      this.phoneerror = "Please enter minimun 10 digit Phonenumber";
      let element: HTMLElement = document.getElementById('number') as HTMLElement;
      element.focus();
    }
    else {
      this.phoneerror = null;
    }
    // console.log(this.phoneerror)
  }
  register() {
    if (this.credentials.imag == "") {
      this.imageerror = "Image is required"
      return false;
    }
    else {
      this.imageerror = null;
      //      }
      this.loading = true;
      /////////------------------------- api to train bot------------------------////////////////

      this.auth.register(this.credentials).subscribe(

        user => {
          console.log("userimg^")
         // let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
          // const headers = new HttpHeaders({
          //   'Content-Type': 'application/x-www-form-urlencoded'
          // })
          console.log(user.image)
          const userimage = user.image+".jpg";
          // const req = this.http.post('https://mybitrade.com:5000/api/detect', {
          //   filename: user.image + ".jpg",
          // })

//face recognisation 

        //  const req = this.http.get('https://mybitrade.com:5000/api/detect?filename='+userimage)

        //     .subscribe(
        //       res => {
        //         this.faceresponse = res;
        //         console.log(this.faceresponse.message);
        //         if(this.faceresponse.message == 'Face Not Found') {
        //           const req = this.http.post('http://localhost:3000/api/delete', {
        //           id: user.id,
        //         })
        //           this.error = 'Your Face Was Not Detected.Please Try Again'
        //         }
        //         else {
               this.router.navigateByUrl('/'); 
        //         }
        //       }, (err) => {
        //         console.log('notyetdone');
        //         this.loading = false;
        //         const req = this.http.post('http://localhost:3000/api/delete', {
        //           id: user.id,
        //         })
        //           .subscribe(
        //             res => {
        //               console.error(err);
        //               this.error = 'please verify all the details';

        //             }
        //           )
        //         console.error(err);
        //         this.error = 'please verify all the details';
        //       }
        //     )
// face recognisation ends 
        }
        , (err) => {
          this.loading = false;
          this.duplicatedata = err;
          console.error(this.duplicatedata.error);
          console.error(this.duplicatedata.error.err.code);
          if(this.duplicatedata.error.err.code == 11000) {
            this.error = 'User With Email or Phone Number Already Registered';
          }
          else {
          this.error = 'please verify all the details';
          }
        });
    }
  }
  // ------------------------------  api to train both ends ------------------------////////////////

}
