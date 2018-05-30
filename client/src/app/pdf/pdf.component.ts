import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, UserDetails } from '../authentication.service';
import * as jquery from 'jquery';
import { Router } from '@angular/router';
import 'jqueryui';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const date = new Date();
let userid, username, useremail , userinitials, todaydate;
@Component({
  selector: 'pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css'],

})

export class PdfComponent implements OnInit {
  details: UserDetails;
  loading = true;
  pdfimages= [];
  userdata: any;
  userlist: any;
  userdetail: any;
  // username: string;
  // useremail: string;
  fileslength: any;
  dragged: null;
  today: number = Date.now();
  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private router: Router,
  ) {


  }

   ngOnInit() {
   //  $('.pdfimg').addClass('droppable');
   this.auth.profile().subscribe(user => {
    this.details = user;
    this.http.get('http://localhost:3000/api/userlist/' + this.details._id + '/' + localStorage.getItem('pdfid'))
    .subscribe(data => {
      this.userdata = data;
      this.userlist = this.userdata.data;
     // console.log(this.userlist);
    });
  });
    const pdfid = localStorage.getItem('pdfid');
    this.http.post('https://mybitrade.com:3000/api/pdfdetail', {pdfid: pdfid})
    .subscribe(data => {
     // this.pdfimages = data;
     let i: number;
     this.fileslength = data;
      for (i = 0; i < this.fileslength.fileslength; i++) {
        this.pdfimages.push('https://mybitrade.com:3000/uploadedpdf/' + pdfid  + '/pdf-' + [i] + '.png');
      }
      this.loading = false;
      setTimeout(() => {
        this.adddroppablehandler();
      }, 5000);
    });

  }
  userselection(uservalue: string) {
   this.http.get('http://localhost:3000/api/userdetail/' + uservalue)
   .subscribe(data => {
  //   console.log(data);
    this.userdetail = data;
    useremail = this.userdetail.data.email;
    username = this.userdetail.data.firstName + ' ' + this.userdetail.data.lastName;
    userid = this.userdetail.data._id;
    userinitials = username.match(/\b\w/g) || [];
    userinitials = ((userinitials.shift() || '') + (userinitials.pop() || '')).toUpperCase();
    todaydate = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() ;
   });
  }

  savehtml() {
    this.loading = true;
    // tslint:disable-next-line:max-line-length
    // this.http.post('http://localhost:3000/api/savehtml', {html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid'), userid: this.details._id , docid: localStorage.getItem('docid'), expdate: localStorage.getItem('expdate')})
    // tslint:disable-next-line:max-line-length
    this.http.post('http://localhost:3000/api/savehtml', {html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid')})
    .subscribe(data => {
      this.loading = false;
      // alert('Email Sent Successfully');
      this.router.navigateByUrl('/actionrequired');
    });
  }
  senddocument() {
    this.loading = true;
    // tslint:disable-next-line:max-line-length
    this.http.post('http://localhost:3000/api/senddocument', {html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid'), userid: this.details._id})
    .subscribe(data => {
      this.loading = false;
      alert('Email Sent Successfully');
      this.router.navigateByUrl('/actionrequired');
    });
  }
  hideme() {

      $('#stickit').css('display', 'none');

  }
  adddroppablehandler() {
  let droppablediv = '';
  let draggablediv = '';
  jquery('.droppable').mouseover(function() {
    droppablediv = this.id;
  });

  jquery('.draggable').draggable({
    start: function(event, ui) {
    draggablediv = $(this).find('h6').html();
    },
    helper: 'clone',
    cursor: 'move'
  });

 
 
  jquery('.droppable').droppable({
    drop: function (event, ui) {
      if (!ui.draggable.hasClass('canvas-element')) {
          console.log('dragged');
          // this.dragged = 'dragged';
          const canvasElement = ui.draggable.clone();
          canvasElement.addClass('canvas-element');
          canvasElement.draggable({
         //  containment: '#image2'
          });
          $('#' + droppablediv).append(canvasElement);
          $('#finish').show();
          // tslint:disable-next-line:max-line-length
          if (draggablediv === 'Initial') {
          canvasElement.append('<div style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 50px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + userinitials + '</div></div></div>');
          $('.canvas-element .form-group').remove();
        } else if (draggablediv === 'Name') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 200px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + username + '</div></div></div>');
            $('.canvas-element .form-group').remove();
          } else if (draggablediv === 'Email') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 500px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + useremail + '</div></div></div>');
            $('.canvas-element .form-group').remove();
          } else if (draggablediv === 'Date') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 300px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + todaydate +  ' </div></div></div>');
            $('.canvas-element .form-group').remove();
          } else if (draggablediv === 'Sign Here') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div class="signhere" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 300px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + username + '</div></div></div>');
           // $('.canvas-element .form-group').remove();
          }
          canvasElement.css({
              left: ((ui.offset.left - $(this).offset().left) + 27 ),
              top: ( ui.offset.top),
              position: 'absolute'
          });
      }
     // this.dragged = 'dragged';
          $('#stickit').css('display', 'block');
  }
});
}

}
