import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, UserDetails } from '../authentication.service';
import * as jquery from 'jquery';
import { Router } from '@angular/router';
import 'jqueryui';
// import { INTERNAL_BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const date = new Date();
let userid, username, useremail, userinitials, todaydate;
@Component({
  selector: 'pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css'],

})

export class PdfComponent implements OnInit {
  details: UserDetails;
  loading = true;
  pdfimages = [];
  userdata: any;
  userlist: any;
  userdetail: any;
  selected: any;
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
      this.http.get('https://mybitrade.com:3001/api/userlist/' + this.details._id + '/' + localStorage.getItem('pdfid'))
        .subscribe(data => {
          this.userdata = data;
          this.userlist = this.userdata.data;
          // console.log(this.userlist);
        });
    });
    const pdfid = localStorage.getItem('pdfid');
    this.http.post('https://mybitrade.com:3001/api/pdfdetail', { pdfid: pdfid })
      .subscribe(data => {
        // this.pdfimages = data;
        let i: number;
        this.fileslength = data;
        for (i = 0; i < this.fileslength.fileslength; i++) {
          this.pdfimages.push('https://mybitrade.com:3001/uploadedpdf/' + pdfid + '/pdf-' + [i] + '.jpg');
        }
        // this.adddroppablehandler();
        this.loading = false;
        setTimeout(() => {
          this.adddroppablehandler();
          // alert();
        }, 10000);
      });

  }
  newValue(val) {
    alert(val);
  }
  userselection(uservalue) {
    // alert(uservalue);
    this.http.get('https://mybitrade.com:3001/api/userdetail/' + uservalue)
      .subscribe(data => {
          // console.log(data);
        this.selected = 'show';
        this.userdetail = data;
        useremail = this.userdetail.data.email;
        username = this.userdetail.data.firstName + ' ' + this.userdetail.data.lastName;
        userid = this.userdetail.data._id;
        userinitials = username.match(/\b\w/g) || [];
        userinitials = ((userinitials.shift() || '') + (userinitials.pop() || '')).toUpperCase();
        todaydate = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        setTimeout(() => {
          this.adddroppablehandler();
          // alert();
        }, 3000);
      });
  }

  savehtml() {
    this.loading = true;
    // tslint:disable-next-line:max-line-length
    // this.http.post('https://mybitrade.com:3001/api/savehtml', {html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid'), userid: this.details._id , docid: localStorage.getItem('docid'), expdate: localStorage.getItem('expdate')})
    // tslint:disable-next-line:max-line-length
    this.http.post('https://mybitrade.com:3001/api/savehtml', { html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid') })
      .subscribe(data => {
        this.loading = false;
        // alert('Email Sent Successfully');
        this.router.navigateByUrl('/actionrequired');
      });
  }
  senddocument() {
    this.loading = true;
    // tslint:disable-next-line:max-line-length
    this.http.post('https://mybitrade.com:3001/api/senddocument', { html: $('.gethtml').html(), pdfid: localStorage.getItem('pdfid'), userid: this.details._id })
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
    // alert();
    let droppablediv = '';
    let draggablediv = '';
    jquery('.droppable').mouseover(function () {
      //alert(this.id)
      //$(this).css('z-index','0');
      droppablediv = this.id;
    });

    jquery('.draggable').draggable({
      start: function (event, ui) {
        draggablediv = $(this).find('h6').html();
        console.log(draggablediv)
      //  alert(draggablediv)
      },
      helper: 'clone',
      cursor: 'move',
     // containment: '.pdfimg'
    //  appendTo: "body",
     // containment: [0,100,10000,10000],
     // opacity: 0.70,
      // zIndex:10000,
     // appendTo: ".pdfimg"
    });



    jquery('.droppable').droppable({
      drop: function (event, ui) {
     // console.log(ui.draggable[0].innerText)
        if (!ui.draggable.hasClass('canvas-element')) {
          console.log('dragged');
         
          // this.dragged = 'dragged';
          const canvasElement = ui.draggable.clone();
          canvasElement.addClass('canvas-element');
          canvasElement.draggable({
            cursor: 'move',
           // containment: [100,400,400,400]
          })
          $('#' + droppablediv).append(canvasElement);
          $('#finish').show();
          // tslint:disable-next-line:max-line-length
          if ($.trim(ui.draggable[0].innerText) == 'Initial') {
            canvasElement.append('<div class="removediv appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 50px;height: 45px; padding: 0 10px;z-index:999;position:absolute"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + userinitials + '</div></div></div>');
           $('.removediv').prev('div.form-group').remove();
            // $('.canvas-element .form-group').remove();
          } else if ($.trim(ui.draggable[0].innerText) == 'Name') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div class="removediv appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 200px;height: 45px; padding: 0 10px"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + username + '</div></div></div>');
            $('.removediv').prev('div.form-group').remove();
          } else if ($.trim(ui.draggable[0].innerText) == 'Email') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div  class="removediv appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 500px;height: 45px; padding: 0 10px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + useremail + '</div></div></div>');
            $('.removediv').prev('div.form-group').remove();
          } else if ($.trim(ui.draggable[0].innerText) == 'Date') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div class="removediv appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 300px;height: 45px; padding: 0 10px; "><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + todaydate + ' </div></div></div>');
            $('.removediv').prev('div.form-group').remove();
          } else if ($.trim(ui.draggable[0].innerText) == 'Signature') {
           // alert('hi')
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<div class="signhere appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 300px;height: 45px;  padding: 0 10px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">' + username + '</div></div></div>');
            // $('.canvas-element .form-group').remove();
          } else if ($.trim(ui.draggable[0].innerText) == 'Text') {
            // tslint:disable-next-line:max-line-length
            canvasElement.append('<input class="appended" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 300px;height: 45px;padding: 0 10px; type="text"/>');
            // $('.canvas-element .form-group').remove();
          } 
          canvasElement.css({
            left: ((ui.offset.left - $(this).offset().left) + 15),
            top: (ui.offset.top-35),
            position: 'absolute'
          });
        }
        // this.dragged = 'dragged';
        $('#stickit').css('display', 'block');
      }
    });
  }

}
