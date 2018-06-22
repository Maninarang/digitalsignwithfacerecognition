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
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public triggerSnapshot(): void {
    this.trigger.next();
    this.Camera = null;
  }
  public toggleWebcam(): void {
    this.Camera = 'true';
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

  constructor(private auth: AuthenticationService, private router: Router, private http: HttpClient) { }
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
      element.focus();
    }
  }
  lname() {
    const empty = this.credentials.lname.length;
    if (empty < 1) {
      this.lnameerror = 'Please enter the lastname';
      const element: HTMLElement = document.getElementById('lname') as HTMLElement;
      element.focus();
    } else {
      this.lnameerror = null;
    }
  }
  fname() {
    const empty = this.credentials.fname.length;
    if (empty < 1) {
      this.fnameerror = 'Please enter the Fastname';
      const element: HTMLElement = document.getElementById('fname') as HTMLElement;
      element.focus();
    } else {
      this.fnameerror = null;
    }
  }
  password() {
    const length = this.credentials.password.length;
    if (length < 8) {
      this.passworderror = 'Please enter minimun 8 digit Password';
      const element: HTMLElement = document.getElementById('password') as HTMLElement;
      element.focus();
    }else {
      this.passworderror = null;
    }
  }
  cpassword() {
    if (this.credentials.password !== this.credentials.cpassword) {
      this.cpassworderror = 'Password and Confirm password Donot match';
      const element: HTMLElement = document.getElementById('cpassword') as HTMLElement;
      element.focus();
    } else {
      this.cpassworderror = null;
    }
  }
  number() {
    const length = this.credentials.phonenumber.length;
    if (length < 10) {
      this.phoneerror = 'Please enter minimun 10 digit Phonenumber';
      const element: HTMLElement = document.getElementById('number') as HTMLElement;
      element.focus();
    } else {
      this.phoneerror = null;
    }
    // console.log(this.phoneerror)
  }
  register() {
    if (this.credentials.imag === '') {
      this.imageerror = 'Image is required';
      return false;
    } else {
      this.imageerror = null;
      //      }
      this.loading = true;
      ///////// ------------------------- api to train bot------------------------////////////////

      this.auth.register(this.credentials).subscribe(

        user => {
          const userimage = user.image + '.jpg';
          const req = this.http.get('https://mybitrade.com:5000/api/detect?filename=' + userimage)

            .subscribe(
              res => {
                this.faceresponse = res;
                if (this.faceresponse.message === 'Face Not Found') {
                  // tslint:disable-next-line:no-shadowed-variable
              const newreq = this.http.post('https://mybitrade.com:3001/api/delete', {id: user.id})
              .subscribe (
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

    }, (err) => {
      this.loading = false;
      this.data = err;
      // console.log(this.data);
      // console.error(this.data.error);
      // console.error(this.data.error.err.code);
      if (this.data.error.err.code === 11000) {
        this.error = 'User With Email or Phone Number Already Registered !!!';
      } else {
        this.error = 'Something Went Wrong.Please Try Again !!!';

      }

    });
  }
}

}
