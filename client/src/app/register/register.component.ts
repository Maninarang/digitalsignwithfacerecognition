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
import { Headers } from '@angular/http';
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
  public recapture = null;
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
  public faceresponse: any;
  public data: any;
  public jagveer = false;
  public passworderrorr = null;
  public withoutImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public triggerSnapshot(): void {
    this.trigger.next();
    this.Camera = null;
    this.recapture = true;
  }
  public toggleWebcam(): void {
    this.Camera = 'true';
    this.recapture = null;
    // console.log("im");
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
    this.credentials.imag = 'image';
    this.hideimg = 'hide';
    this.showWebcam = false;
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  constructor(private auth: AuthenticationService, private router: Router, private http: HttpClient) {
    if (auth.isLoggedIn()) {
      router.navigate(['digital_sign']);
    }
  }

  registerwithoutimage() {
if (this.withoutImage === 'Selected') {
  this.withoutImage = null;
}else {
  this.withoutImage = 'Selected';

}
  }

  checkmail() {
    // const element = this.credentials.selectRootElement('#input1');

    // setTimeout(() => element.focus(), 0);
    this.mailerror = '';
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    // console.log( regex.test(this.credentials.email));
    if (regex.test(this.credentials.email)) {
      this.mailerror = null;
    } else {

      this.mailerror = 'Please enter a valid email';
      const element: HTMLElement = document.getElementById('email') as HTMLElement;
      // element.focus();
    }
  }
  lname() {
    const empty = this.credentials.lname.length;
    if (empty < 1) {
      this.lnameerror = 'Please enter the lastname';
      const element: HTMLElement = document.getElementById('lname') as HTMLElement;
      //  element.focus();
    } else {
      this.lnameerror = null;
    }
  }
  fname() {
    const empty = this.credentials.fname.length;
    if (empty < 1) {
      this.fnameerror = 'Please enter the Firstname';
      const element: HTMLElement = document.getElementById('fname') as HTMLElement;
      //  element.focus();
    } else {
      this.fnameerror = null;
    }
  }
  password() {
    var tests = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Z-0-9]/i]
    //this.jagveer=false;
    const length = this.credentials.password.length;
    // if (length < 8) {
    //   this.passworderror = 'Please enter minimum 8 digit Password';
    //   const element: HTMLElement = document.getElementById('password') as HTMLElement;
    // //  element.focus();
    // }else {
    //   this.passworderror = null;

    // }
    if (this.credentials.password == null)
      return -1;
    var s = 0;
    if (length == 0) {
      this.passworderror = "Please input password ";
      this.passworderrorr = "Please input password ";
    }
    if (length < 8)
      this.passworderror = "Very Weak";
    this.passworderrorr = "Very Weak";

    for (let i in tests)
      if (tests[i].test(this.credentials.password))
        s++;
    // return s;
    if (s == 0) {
      this.passworderror = 'Very Weak';
      this.passworderrorr = 'Very Weak';

    }
    else if (s == 2) {
      this.passworderror = 'Weak';
      this.passworderrorr = 'Weak';

    }
    else if (s == 3) {
      this.passworderror = 'Normal';
      this.passworderrorr = 'Normal';

    }
    else if (s == 4) {
      //this.jagveer=false;
      this.passworderror = '';
      this.passworderrorr = 'Strong';


    }
    //this.passworderror =s
    console.log(s);
  }

  blurr() {
    this.jagveer = false;

  }

  cpassword() {
    if (this.credentials.password !== this.credentials.cpassword) {
      this.cpassworderror = 'Password and Confirm password Donot match';
      const element: HTMLElement = document.getElementById('cpassword') as HTMLElement;
      //  element.focus();
    } else {
      this.cpassworderror = null;
    }
  }
  number() {
    const length = this.credentials.phonenumber.length;
    if (length < 10) {
      this.phoneerror = 'Please enter minimum 10 digit Phonenumber';
      const element: HTMLElement = document.getElementById('number') as HTMLElement;
      //  element.focus();
    } else {
      this.phoneerror = null;
    }
    // console.log(this.phoneerror)
  }
  register() {
    console.log('im---');
    if (this.withoutImage != null) {
      this.credentials.image = 'none';
      console.log('yoyo');
    }

    if (this.credentials.image === '') {
      this.imageerror = 'Image is required';
      return false;
    } else {
      this.imageerror = null;
      //      }
      this.loading = true;
      ///////// ------------------------- api to train bot------------------------////////////////

      this.auth.register(this.credentials).subscribe(

        user => {
          console.log(user.image);
if (  user.image === 'none') {
  console.log('you');

  this.loading = false;
  console.log(user);
  this.router.navigateByUrl('/digital_sign');
}else {
  console.log('me');
          const userimage = user.image + '.jpg';
          console.log('imageis->',userimage);
          const req = this.http.get('https://mybitrade.com:5000/api/detect?filename=' + userimage)

            .subscribe(
              res => {
                this.faceresponse = res;
                if (this.faceresponse.message === 'Face Not Found') {
                  // tslint:disable-next-line:no-shadowed-variable
                  const newreq = this.http.post('https://mybitrade.com:3001/api/delete', { id: user.id })
                    .subscribe(
                      // tslint:disable-next-line:no-shadowed-variable
                      res => {
                        this.loading = false;
                        this.error = 'Your Face Was Not Detected.Please Try Again';
                      }
                    );
                } else {
                  this.router.navigateByUrl('/digital_sign');
                }
              }
              , (err) => {
                this.error = 'Something Went Wrong.Please Try Again !!!';
              });
            }  // else
        }, (err) => {
          this.loading = false;
          this.data = err;
          console.log(this.data);
          console.error(this.data.error);
          console.error(this.data.error.err);
          if (this.data.error.err.code === 11000) {
            this.error = 'User With Email or Phone Number Already Registered !!!';
          } else {
            this.error = 'Something Went Wrong.Please Try Again !!!';

          }

        });
    }
  // }
  }
  isFocused() {
    this.jagveer = true;
  }

}
