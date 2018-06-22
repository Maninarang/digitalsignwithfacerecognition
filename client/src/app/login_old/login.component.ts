import { Component } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../authentication.service';
import { Router } from '@angular/router';
import {WebcamImage} from 'ngx-webcam';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: TokenPayload = {
    email: '',
    password: '',
    image: '',
    phonenumber: '',
    cpassword: '',
    fname: '',
    lname: ''
  };
  public error = null;


  public showWebcam = false;
  public loading = false;
  // public imagesrc = '' ;
  public Camera = null;
  public shwlogin = null;
  // latest snapshot
  public webcamImage: WebcamImage = null;
  public mailerror = null;
  public faceresponse: any;
  loginerror: any;
    // webcam snapshot trigger
    private trigger: Subject<void> = new Subject<void>();

    public triggerSnapshot(): void {
      this.trigger.next();
      this.Camera = null;
      this.shwlogin = 'true';
    }
    public toggleWebcam(): void {
      this.Camera = 'true';
      this.shwlogin = null;
      // console.log("im");
      this.showWebcam = !this.showWebcam;
      if (this.webcamImage) {
        this.webcamImage = null ;
      }
    }
    public handleImage(webcamImage: WebcamImage): void {
     // console.info('received webcam image', webcamImage);
      this.webcamImage = webcamImage;
     // console.log(JSON.stringify(webcamImage));
      this.credentials.image = webcamImage.imageAsDataUrl;
      this.credentials.imag = 'image';
      this.showWebcam = false;
    }
    public get triggerObservable(): Observable<void> {
      return this.trigger.asObservable();
    }
    checkmail() {
      this.mailerror = '';
      const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (regex.test(this.credentials.email)) {
        this.mailerror = null;
      } else {
        this.mailerror = 'Please enter a valid email';
        const element: HTMLElement = document.getElementById('email') as HTMLElement;
        element.focus();
      }
    }


  constructor(private auth: AuthenticationService, private router: Router, private http: HttpClient) {}

  login() {
    this.loading = true;
    this.auth.login(this.credentials).subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      res => {
        const req = this.http.post('https://mybitrade.com:3001/api/email', {
          email: this.credentials.email,
          image: this.credentials.image
        })
          // tslint:disable-next-line:no-shadowed-variable
          .subscribe( (res: any)  => {
          //  console.log(res)
          //   const req=this.http.post('https://mybitrade.com:5000/api/recognize', {
          //     knownfilename: res.knownimage ,
          //     unknownfilename:res.unknownimage
          //   }
          // )
          // tslint:disable-next-line:max-line-length
          // tslint:disable-next-line:no-shadowed-variable
          const req = this.http.get('https://mybitrade.com:5000/api/recognize?knownfilename=' + res.knownimage + '&unknownfilename=' + res.unknownimage + '.jpg')
          .subscribe(
                // tslint:disable-next-line:no-shadowed-variable
                res => {
                  this.faceresponse = res;
                  if (this.faceresponse.message === 'No Face Found') {
                    this.loading = false;
                    this.error = 'Your Face Was Not Detected.Please Try Again';
                  } else if (this.faceresponse.message === 'Match Not Found') {
                    this.loading = false;
                    this.error = 'Failed To Recognise You.Please Try Again';
                  } else {
                  this.router.navigateByUrl('/digital_sign');
                  }
                      },
            err => {
              this.loading = false;
              this.error = 'Failed To Recognise You';
              console.log('Error occured');
            });
        });
             }, (err) => {
              this.loading = false;
              this.loginerror = err;
              console.log(this.loginerror);
              console.log(this.loginerror.error.message);
              if (this.loginerror.error.message === 'Password is wrong') {
              this.error = 'Invalid Password';
              }else if (this.loginerror.error.message === 'User not found') {
                this.error = 'Invalid Email Address';
              } else {
                this.error = 'Something Went Wrong.Please Try Again !!!';
              }
            });
 
  }
}
