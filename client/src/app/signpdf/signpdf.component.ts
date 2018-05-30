import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { AuthenticationService, UserDetails, TokenPayload} from '../authentication.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {WebcamImage} from 'ngx-webcam';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';


@Component({
  selector: 'app-signpdf',
  templateUrl:  './signpdf.component.html',
  styleUrls: ['./signpdf.component.css']
})

export class SignpdfComponent implements OnInit {
  credentials: TokenPayload = {
    email: '',
    password: '',
    image: '',
    phonenumber: '',
    cpassword: '',
    fname: '',
    lname: ''
  };
  html: any;
  documenthtml: SafeHtml;
  details: UserDetails;
  userid: String;
  useremail: String;
  username: String;
  eligibility: any;
  eligible: Number;
  loading = true;
  camera = null;
  imagecaptured = null;
  webcamImage: WebcamImage = null;
  showWebcam = false;
  faceresponse: any;
  error = null;
  trigger: Subject<void> = new Subject<void>();


  constructor(
     private http: HttpClient,
     private activatedRoute: ActivatedRoute,
     private auth: AuthenticationService,
     private router: Router,
     private sanitized: DomSanitizer,
    ) {}

  ngOnInit() {
   // this.loading = true;
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
      const userid = params['userid'];
      this.auth.profile().subscribe(user => {
        this.details = user;
        this.userid = this.details._id;
        this.useremail = this.details.email;
        this.username = this.details.name;
        this.http.get('http://localhost:3000/api/checkeligibility/' + this.useremail + '/' + documentid + '/' + userid)
        .subscribe(data => {
          this.eligibility = data;
          this.eligible = this.eligibility.data;
          if (this.eligible !== 1) {
            this.router.navigateByUrl('/');
          } else {
            this.http.get('http://localhost:3000/api/getdocument/' + this.userid + '/' + documentid)
            .subscribe(
              // tslint:disable-next-line:no-shadowed-variable
              data => {
                this.html = data;
                this.documenthtml = this.sanitized.bypassSecurityTrustHtml(this.html.data.documenthtml);
                this.loading = false;
              });
            }
        });
      });
        });
  }

   toggleWebcam(): void {
     this.error = null;
    this.camera = true;
    this.imagecaptured = null;
    // console.log("im");
    this.showWebcam = !this.showWebcam;
    if (this.webcamImage) {
      this.webcamImage = null ;
    }
  }

   triggerSnapshot(): void {
    this.trigger.next();
    this.camera = null;
    this.imagecaptured = true;
  }

  handleImage(webcamImage: WebcamImage): void {
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

  //  verifyuser() {
  //   this.loading = true;
  //   this.auth.profile().subscribe(user => {
  //   this.details = user;
  //   this.useremail = this.details.email;
  //     this.http.post('https://mybitrade.com:3000/api/email', {
  //       email: this.useremail,
  //       image: this.credentials.image
  //     })  .subscribe( (res: any)  => {
  //       // tslint:disable-next-line:max-line-length
  //       const req = this.http.get('https://mybitrade.com:5000/api/recognize?knownfilename=' + res.knownimage + '&unknownfilename=' + res.unknownimage + '.jpg')
  //       .subscribe(
  //             // tslint:disable-next-line:no-shadowed-variable
  //             res => {
  //               this.faceresponse = res;
  //               if (this.faceresponse.message === 'No Face Found') {
  //                 this.loading = false;
  //                 this.error = 'Your Face Was Not Detected.Please Try Again';
  //               } else if (this.faceresponse.message === 'Match Not Found') {
  //                 this.loading = false;
  //                 this.error = 'Failed To Recognise You.Please Try Again';
  //               } else {
  //             //  this.router.navigateByUrl('/digital_sign');
  //             // alert('Verified');
  //             this.loading = false;
  //             // tslint:disable-next-line:max-line-length
  //             $('.signhere div div').append('<button type="button" class="signbutton" style="background-color: #715632; font-size: 22px; padding: 8px 12px; color: white; border: none; box-shadow: -1px 0px 5px 0px #191919;">Click to Sign</button>');
  //             $('.signbutton').click(function() {
  //               $(this).parent().css({
  //                 'font-family': 'serif',
  //                 'text-transform': 'lowercase'
  //               });
  //               $(this).closest('.signhere').css('border', 'none');
  //               // const date = Date.now();
  //               // console.log(this.datePipe.transform(date, 'yyyy-MM-dd'));
  //               const now = new Date();
  //               const year = '' + now.getFullYear();
  //               let month = '' + (now.getMonth() + 1); if (month.length === 1) { month = '0' + month; }
  //               let day = '' + now.getDate(); if (day.length === 1) { day = '0' + day; }
  //               let hour = '' + now.getHours(); if (hour.length === 1) { hour = '0' + hour; }
  //               let minute = '' + now.getMinutes(); if (minute.length === 1) { minute = '0' + minute; }
  //               let second = '' + now.getSeconds(); if (second.length === 1) { second = '0' + second; }
  //               const signdate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second;
  //               $(this).parent().append( '<br>' + signdate);
  //               $(this).remove();
  //             });
  //           }
  //                   },
  //         err => {
  //           this.loading = false;
  //           this.error = 'Failed To Recognise You';
  //         //  alert('Failed To Recognise You');
  //           console.log('Error occured');
  //         });
  //     });
  //   });
  //  }

  verifyuser() {
    this.loading = false;
    // tslint:disable-next-line:max-line-length
    $('div.signhere:contains(' + this.username + ') div div').append('<button type="button" class="signbutton" style="background-color: #715632; font-size: 22px; padding: 8px 12px; color: white; border: none; box-shadow: -1px 0px 5px 0px #191919;">Click to Sign</button>');
    $('.signbutton').click(function() {
      $(this).parent().css({
        'font-family': 'serif',
        'text-transform': 'lowercase'
      });
      $(this).closest('.signhere').css('border', 'none');
      // const date = Date.now();
      // console.log(this.datePipe.transform(date, 'yyyy-MM-dd'));
      const now = new Date();
      const year = '' + now.getFullYear();
      let month = '' + (now.getMonth() + 1); if (month.length === 1) { month = '0' + month; }
      let day = '' + now.getDate(); if (day.length === 1) { day = '0' + day; }
      let hour = '' + now.getHours(); if (hour.length === 1) { hour = '0' + hour; }
      let minute = '' + now.getMinutes(); if (minute.length === 1) { minute = '0' + minute; }
      let second = '' + now.getSeconds(); if (second.length === 1) { second = '0' + second; }
      const signdate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second;
      $(this).parent().append( '<br>' + signdate);
      $(this).closest('.signhere').prev('div').remove();
      $(this).remove();
    });
  }

  updatesignature() {
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
    this.http.post('http://localhost:3000/api/updatedoc', { html: $('.gethtml').html(), userid: this.userid, docid: documentid })
    .subscribe(
      data => {

      });
    });
  }
}


