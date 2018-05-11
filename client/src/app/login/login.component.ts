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
    phonenumber:'',
    cpassword:'',
    fname:'',
    lname:''
  };
  public error = null;


  public showWebcam = false;
  public loading = false;
  // public imagesrc = '' ;
public Camera =null;
public shwlogin =null;
  // latest snapshot
  public webcamImage: WebcamImage = null;
  public mailerror = null;
  public faceresponse :any;
    // webcam snapshot trigger
    private trigger: Subject<void> = new Subject<void>();

    public triggerSnapshot(): void {
      this.trigger.next();
      this.Camera =null;
      this.shwlogin="true";
    }
    public toggleWebcam(): void {
      this.Camera ="true";
      this.shwlogin=null;
      console.log("im");
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
      this.credentials.imag = "image";
      
      this.showWebcam = false;
    }
    public get triggerObservable(): Observable<void> {
      return this.trigger.asObservable();
    }
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


  constructor(private auth: AuthenticationService, private router: Router,private http: HttpClient) {}

  login() {
    /////////------------------------- api to match Image ------------------------////////////////
    this.loading = true;
    // const req = this.http.post('http://127.0.0.1:3000/api/email', {
      const req = this.http.post('http://localhost:3000/api/email', {
      email: this.credentials.email,
      image: this.credentials.image
    })
      .subscribe( (res:any) => {
        console.log(res)
      //   const req=this.http.post('https://mybitrade.com:5000/api/recognize', {
      //     knownfilename: res.knownimage ,
      //     unknownfilename:res.unknownimage
      //   }
      // )
      const req = this.http.get('https://mybitrade.com:5000/api/recognize?knownfilename='+res.knownimage+'&unknownfilename='+res.unknownimage+'.jpg')

      .subscribe(
            res => {
              console.log(res)
              console.log('done');
              this.faceresponse = res;
              if(this.faceresponse.message == 'No Face Found')
              {
                this.loading = false;
                this.error = 'Your Face Was Not Detected.Please Try Again'
              }
              else if(this.faceresponse.message == 'Match Not Found') {
                this.loading = false;
                this.error = 'Failed To Recognise You.Please Try Again'
              }
              else {
              this.router.navigateByUrl('/');
              }
           this.auth.login(this.credentials).subscribe(
            res => {

            // const req = this.http.post('https://mybitrade.com:5000/api/recognize', {
            //   knownfilename: res.knownimage ,
            //   unknownfilename:res.unknownimage
            // })
            //   .subscribe(
            //     res => {
            //       console.log(res)
            //       console.log('done');
            //       this.router.navigateByUrl('/');
                
    //  this.router.navigateByUrl('/home');
    }, (err) => {
      this.loading = false;
      this.error = 'Invalid Email/Password';
      console.error("--.>",err.statusText);
    });
        },
        err => {
          this.loading = false;
          this.error = 'Failed To Recognise You';
          console.log("Error occured");
        }
      ); 
    })
// ------------------------------  api to match Image ends ------------------------////////////////
    //  this.auth.login(this.credentials).subscribe(() => {
    //   this.router.navigateByUrl('/home');
    // }, (err) => {
		//  this.loading = false;
    //   this.error = 'Invalid Email/Password';
    //    console.error("--.>",err.statusText);
    // });

  }
}
