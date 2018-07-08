import { Component, OnInit, Inject, ViewChild, ElementRef, Input, Pipe, PipeTransform, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService, UserDetails, TokenPayload } from '../authentication.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebcamImage } from 'ngx-webcam';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
let RecordRTC = require('recordrtc/RecordRTC.min');


// tslint:disable-next-line:use-pipe-transform-interface
@Pipe({ name: 'noSanitize' })
@Component({
  selector: 'app-signpdf',
  templateUrl: './newsignpdf.component.html',
  styleUrls: ['./newsignpdf.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NewsignpdfComponent implements OnInit {
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
  userid: string;
  useremail: String;
  username: String;
  eligibility: any;
  eligible: Number;
  unknownimage: any;
  documentid: any;
  usertosign: any;
  loading = true;
  camera = null;
  imagecaptured = null;
  webcamImage: WebcamImage = null;
  showWebcam = false;
  faceresponse: any;
  error = null;
  showpdf = null;
  clas = null;
  conveniancecount: Number;
  stream: MediaStream;
  recordRTC: any;
  trigger: Subject<void> = new Subject<void>();
  @ViewChild('video') video;
  @ViewChild('gethtml') gethtml: any;
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private auth: AuthenticationService,
    private router: Router,
    private sanitized: DomSanitizer,
  ) { }

  ngOnInit() {
    var ip = window.location.origin;
   // console.log('ip here->', ip);
    // alert(pathname);
    // alert(url);

    this.conveniancecount = 0;
    // this.loading = true;
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
      const userid = params['userid'];
      const usertosign = params['usertosign'];
      this.auth.profile().subscribe(user => {
        this.details = user;
        this.userid = this.details._id;
        this.useremail = this.details.email;
        this.username = this.details.name;
        this.documentid = documentid;
        this.usertosign = usertosign;
        this.http.get('https://mybitrade.com:3001/api/checkeligibility/' + this.useremail + '/' + documentid + '/' + userid)
          .subscribe(data => {
            this.eligibility = data;
            this.eligible = this.eligibility.data;
            if (this.eligible !== 1) {
              this.router.navigateByUrl('/');
            } else {
              this.http.get('https://mybitrade.com:3001/api/getdocument/' + this.userid + '/' + documentid)
                .subscribe(
                  // tslint:disable-next-line:no-shadowed-variable
                  data => {
                    this.html = data;
                    this.documenthtml = this.html.data.documenthtml;
                    // this.gethtml.innerHTML = this.html.data.documenthtml;
                    // this.documenthtml = this.sanitized.bypassSecurityTrustHtml(this.html.data.documenthtml);
                    this.loading = false;
                  });
            }
          });
      });
    });

  }

  ngAfterViewInit() {
    // set the initial state of the video
    let video:HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  successCallback(stream: MediaStream) {

    var options = {
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 128000,
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };
    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    let video: HTMLVideoElement = this.video.nativeElement;
   // video.src = window.URL.createObjectURL(stream); ---------  depriciated
    video.srcObject = stream;
    this.toggleControls();
  }

  errorCallback() {
    //handle error here
  }

  processVideo(audioVideoWebMURL) {
    let video: HTMLVideoElement = this.video.nativeElement;
    let recordRTC = this.recordRTC;
    video.src = audioVideoWebMURL;
    this.toggleControls();
    var recordedBlob = recordRTC.getBlob();
    var fileName = 'abc';
                
                var file = new File([recordedBlob], fileName, {
                    type: 'video/webm'
                });
                const formData: FormData = new FormData();
                formData.append('filetoupload', file);
                formData.append('userid',this.usertosign);
                formData.append('docid',this.documentid);
                this.http.post('https://mybitrade.com:3001/api/uploadvideofile', formData)
                  .subscribe(data => {
                  });
    recordRTC.getDataURL(function (dataURL) { });
  }
 
  startRecording() {
    let mediaConstraints: any;
     mediaConstraints = {
      video: {
        mandatory: {
          maxWidth: 320,
          maxHeight: 240
        }
      }, audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }

  stopRecording() {
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
  }

  toggleWebcam(): void {
    this.error = null;
    this.camera = true;
    this.imagecaptured = null;
    console.log('im');
    this.showWebcam = !this.showWebcam;
    if (this.webcamImage) {
      this.webcamImage = null;
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

  verifyuser() {

    this.loading = true;
    this.auth.profile().subscribe(user => {
      this.details = user;
      this.useremail = this.details.email;
      this.http.post('https://mybitrade.com:3001/api/email', {
        email: this.useremail,
        image: this.credentials.image
      }).subscribe((res: any) => {
        // tslint:disable-next-line:max-line-length
        this.unknownimage = res.unknownimage;
        const req = this.http.get('https://mybitrade.com:5000/api/recognize?knownfilename=' + res.knownimage + '&unknownfilename=' + res.unknownimage + '.jpg')
          .subscribe(
            // tslint:disable-next-line:no-shadowed-variable
            res => {
              this.faceresponse = res;
              console.log(this.faceresponse);
              if (this.faceresponse.message === 'No Face Found') {
                this.loading = false;
                this.error = 'Your Face Was Not Detected.Please Try Again';
              } else if (this.faceresponse.message === 'Match Not Found') {
                this.loading = false;
                this.error = 'Failed To Recognise You.Please Try Again';
              } else {
                this.startRecording();
                // tslint:disable-next-line:max-line-length
                // tslint:disable-next-line:no-shadowed-variable
                const req = this.http.post('https://mybitrade.com:3001/api/signeduserimage', { userid: this.usertosign, docid: this.documentid, imagename: this.unknownimage }).subscribe(res => {

                });

                this.showpdf = true;
                //  this.router.navigateByUrl('/digital_sign');
                // alert('Verified');
                this.loading = false;
                // this.conveniancecount = 10;
                // setTimeout(function () {
                setTimeout(() => {
                  var number = 0;
                  this.conveniancecount = 13;
                  const pathname = window.location.pathname; // Returns path only
                  const url = window.location.href;
                  const lastslashindex = url.lastIndexOf('/');
                  this.clas = url.substring(lastslashindex + 1);
                  const result = this.clas;
                  const numItems = $('.' + result).length;
                  console.log(numItems);
                  // tslint:disable-next-line:max-line-length
                  $('.dell').css('display', 'none');
                  // $('.gethtml').find('.dell').remove();
                  $('.' + result + '1 div div').append('<br><button type="button" class="signbutton removeme" style="background-color: #715632; width:100px; font-size: 22px; padding: 8px 12px; color: white; border: none; box-shadow: -1px 0px 5px 0px #191919;">Click to Sign</button><br>');
                  //  $('.' + result + ' div div').css('pointer-events', 'none');
                  //  $('.' + result + ' div div button').css('cursor', 'pointer');

                  // $('.' + result + '1 div div').css('pointer-events', 'none');
                  // alert(this.clas);
                  this.conveniancecount = $('div[class*=\'' + result + '\']').length;

                  //   alert(this.conveniancecount);
                  // }, 3000);
                  // this.conveniancecount = 56;
                  const y = $('.' + result + '1').position();
                  //alert(y.top)
                  $('html, body').animate({
                    scrollTop: ($('.' + result + '1' ).offset().top + y.top)
                  }, 500);
                  $('.' + result).click(function () {
                    // alert(result);
                    // this.conveniancecount=  this.conveniancecount -1;
                    number++;
                    // let inc = number + 1;
                    $(this).parent().css({
                      'font-family': 'serif',
                      'text-transform': 'lowercase'
                    });
                    $(this).closest('.' + result).css('border', 'none');
                    // alert($(this).text());
                    const strng = $(this).text();
                    // alert(strng)
                    let res = strng.replace('Click to Sign', '');
                    // alert(res)
                    // tslint:disable-next-line:max-line-length
                    $(this).parent().append('<div style="word-wrap: break-word;text-align: left;font-family: Cursive, Sans-Serif;font-size: 24px;font-weight: 400;font-style: italic;color: rgb(20, 83, 148);">' + res + '</div>');
                    // $(this).closest('.removeme').css('display', 'none');
                    //   $('html, body').animate({
                    //     'scrollTop' : $(this).closest('.'+result).position().top;
                    //     alert()
                    // });
                    const num = number + 1;
                    // tslint:disable-next-line:max-line-length
                    $('.' + result + '' + num + ' div div').append('<br><button type="button" class="signbutton removeme" style="background-color: #715632; width:100px; font-size: 22px; padding: 8px 12px; color: white; border: none; box-shadow: -1px 0px 5px 0px #191919;">Click to Sign</button><br>');

                    console.log('-->.' + result + '' + num);
                    const x = $('.' + result + '' + num).position();
                    if (number < numItems) {
                      $('html, body').animate({
                        scrollTop: ($('.' + result + '' + num).offset().top + x.top - 100)
                      }, 500);
                    }

                    // let next;
                    // next = $(this).nextAll('.' + result).next();
                    // alert(next);
                    // $('html,body').scrollTop(next);
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
                    $(this).parent().append('<br>' + signdate);
                    //  alert(JSON.stringify($(this).html()));
                    $(this).remove();
                    // $(this).remove();
                    // alert();

                  });
                  // }
                }, 300);
                // );
              }
            },
            err => {
              this.loading = false;
              this.error = 'Failed To Recognise You';
              //  alert('Failed To Recognise You');
              console.log('Error occured');
            });
      });
    });
  }

  // verifyuser() {
  //   this.loading = false;
  //   // tslint:disable-next-line:max-line-length
  // tslint:disable-next-line:max-line-length
  //   $('div.signhere:contains(' + this.username + ') div div').append('<button type="button" class="signbutton" style="background-color: #715632; font-size: 22px; padding: 8px 12px; color: white; border: none; box-shadow: -1px 0px 5px 0px #191919;">Click to Sign</button>');
  //   $('.signbutton').click(function() {
  //     $(this).parent().css({
  //       'font-family': 'serif',
  //       'text-transform': 'lowercase'
  //     });
  //     $(this).closest('.signhere').css('border', 'none');
  //     // const date = Date.now();
  //     // console.log(this.datePipe.transform(date, 'yyyy-MM-dd'));
  //     const now = new Date();
  //     const year = '' + now.getFullYear();
  //     let month = '' + (now.getMonth() + 1); if (month.length === 1) { month = '0' + month; }
  //     let day = '' + now.getDate(); if (day.length === 1) { day = '0' + day; }
  //     let hour = '' + now.getHours(); if (hour.length === 1) { hour = '0' + hour; }
  //     let minute = '' + now.getMinutes(); if (minute.length === 1) { minute = '0' + minute; }
  //     let second = '' + now.getSeconds(); if (second.length === 1) { second = '0' + second; }
  //     const signdate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second;
  //     $(this).parent().append( '<br>' + signdate);
  //     $(this).closest('.signhere').prev('div').remove();
  //     $(this).remove();
  //   });
  // }

  updatesignature() {
    this.stopRecording();
    this.loading = true;
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
      this.http.post('https://mybitrade.com:3001/api/updatedoc', { html: $('.gethtml').html(), userid: this.userid, docid: documentid, reciptemail: this.useremail })
        .subscribe(
          data => {
            this.loading = false;
            alert('document Sent Successfully');
            this.router.navigateByUrl('/landing');
          });
    });
  }
}


