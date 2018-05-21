import { Component, OnInit, Inject, ViewChild , ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactsarrayService } from '../contactsarray.service';
// import {ModalModule} from 'ngx-modal';
// import { DialogService } from 'ng2-bootstrap-modal';
// import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-digital-sign',
  templateUrl: './digital-sign.component.html',
  styleUrls: ['./digital-sign.component.css']
})
export class DigitalSignComponent implements OnInit {
    details: UserDetails;
    innerHtml: SafeHtml;
    pdfpath: any;
    loading = false;
    files: UploadFile[] = [];
    fullname: String;
    firstName: String;
    email: String;
    lastName: String;
    userid: String;
    count: any;
    error: String;
    contactList: any;
    contacts = [];
    mycontacts: any;
    showcontacts: any;
    contactdata: any;
    contactfirstName: String;
    contactlastName: String;
    contactemail: String;
    contactaddress: String;
    documentcount: String;
    showexpdate = false;
    myOptions: INgxMyDpOptions = {
      // other options...
      dateFormat: 'mm-dd-yyyy',
  };
  model: any = { jsdate: new Date() };
  @ViewChild('addparticipantModal') addparticipantModal: ElementRef;
  @ViewChild('contactdetailModal') contactdetailModal: ElementRef;
  @ViewChild('mycontactsModal') mycontactsModal: ElementRef;
  constructor(private http: HttpClient,
              private domSanitizer: DomSanitizer,
              private auth: AuthenticationService,
              private fb: FormBuilder,
              private contactarray: ContactsarrayService
             // private dialogService: DialogService
             ) {}
   addparticipantForm = this.fb.group({
    type: ['', Validators.required],
    firstName: ['', Validators.required],
    email: ['', Validators.required],
    lastName: ['', Validators.required],
    address: [],
    subject: [],
    message: []
    });

    addyourselfForm = this.fb.group({
      type: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [],
      subject: [],
      message: []
      });

    contactdetailForm = this.fb.group({
        type: ['', Validators.required],
        firstName: ['', Validators.required],
        email: ['', Validators.required],
        lastName: ['', Validators.required],
        address: [],
        subject: [],
        message: []
        });

  ngOnInit() {
    this.auth.profile().subscribe(user => {
      this.details = user;
      this.fullname = this.details.name;
      this.email = this.details.email;
      const nameArr = this.fullname.split(' ');

      if (nameArr.length > 2) {
        this.lastName = nameArr.pop();
        this.firstName = nameArr.join(' ');
      } else {
        this.firstName = nameArr[0];
        this.lastName = nameArr[nameArr.length - 1];
      }
      this.userid = this.details._id;
      this.http.get('http://localhost:3000/api/documentcount/' + this.userid)
    .subscribe(data => {
      this.count = data;
      this.documentcount = this.count.data;
      this.http.get('http://localhost:3000/api/mycontacts/' + this.userid)
      // tslint:disable-next-line:no-shadowed-variable
      .subscribe(data => {
        this.showcontacts = data;
        this.mycontacts = this.showcontacts.data;
      });
    });
    });
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        const file: File = fileList[0];
        const formData: FormData = new FormData();
        this.loading = true;
        formData.append('filetoupload', file, file.name);
        this.http.post('https://mybitrade.com:3000/api/uploadfile', formData)
        .subscribe(data => {
            this.pdfpath = data;
            localStorage.setItem('pdfid', this.pdfpath.pdfid);
            this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
                // tslint:disable-next-line:max-line-length
                '<object data="' + 'https://mybitrade.com:3000' + this.pdfpath.path + '" type="application/pdf" class="embed-responsive-item">' +
                'Object' + this.pdfpath.path + ' failed' +
                '</object>');
                this.loading = false;
          });
    }
}
  showpdf() {
    this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
        '<object data="' + 'https://mybitrade.com:3000' + this.pdfpath.path + '" type="application/pdf" class="embed-responsive-item">' +
        'Object' + this.pdfpath.path + ' failed' +
        '</object>');
        this.loading = false;
 }

  filedropped(event: UploadEvent) {
    this.files = event.files;
    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
       this.loading = true;
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          // console.log(droppedFile.relativePath, file);
          const formData = new FormData();
          formData.append('filetoupload', file, droppedFile.relativePath);
          //  this.http.post('http://127.0.0.1:3000/api/uploadfile', formData, { headers: headers })
          this.http.post('https://mybitrade.com:3000/api/uploadfile', formData)
          .subscribe(data => {
            this.pdfpath = data;
            localStorage.setItem('pdfid', this.pdfpath.pdfid);
            const element: HTMLElement = document.getElementById('showpdf') as HTMLElement;
            element.click();
                });


        });
      } else {
      }
    }
  }

  onDateChanged(event: IMyDateModel): void {
    // date selected
  }

 // ------------------------ add new participant --------------------- //

  addnewparticipant() {
   let type = this.addparticipantForm.controls.type.value;
   if (type === '') {
    type = 'Remote Signer';
    }
   const firstName = this.addparticipantForm.controls.firstName.value;
   const lastName = this.addparticipantForm.controls.lastName.value;
   const email = this.addparticipantForm.controls.email.value;
   const address = this.addparticipantForm.controls.address.value;
   const subject = this.addparticipantForm.controls.subject.value;
   const message = this.addparticipantForm.controls.message.value;
   const emailalreadyexist = this.contacts.some(function (el) {
    return el.email === email;
  });
  if (!emailalreadyexist) {
    this.contactarray.pushcontacts(firstName, lastName, email, address, subject, message, this.userid);

  //  this.http.post('http://localhost:3000/api/addnewparticipant',
  //    { firstName: firstName, lastName: lastName, email: email, address: address,
  //      subject: subject, message: message, userId: this.userid })
  //    .subscribe(data => {
  //      this.contactList = data;
  //      if (this.contactList.message === 1) {
  //       this.contacts.push({name: firstName + ' ' + lastName, type: type, email: email });
  //       this.addparticipantForm.reset();
  //       this.addparticipantModal.close();
  //      } else {
  //       this.error = 'This Email is already in your Contacts.You can add from there!!!';
  //      }
  //    }, err => {
  //      this.error = 'Something Went Wrong.Please Try Again !!!';
  //    });
  }  else {
    this.error = 'Email Already Exists';
    }
  }
   // ------------------------ get contact details ------------- //

   contactdetail(email: String) {
   this.mycontactsModal.close();
   this.loading = true;
   this.http.get('http://localhost:3000/api/contactdetail/' + email + '/' + this.userid)
   .subscribe(data => {
    this.contactdata = data;
    this.contactfirstName = this.contactdata.data[0].firstName;
    this.contactlastName = this.contactdata.data[0].lastName;
    this.contactemail = this.contactdata.data[0].email;
    this.contactdetailModal.open();
    this.loading = false;
   });
   }

   // ------------------------ add participant from contacts------ //

   // ------------------------ add new participant --------------------- //

   addfromcontact() {
    let type = this.contactdetailForm.controls.type.value;
    if (type === '') {
     type = 'Remote Signer';
     }
    const firstName = this.contactdetailForm.controls.firstName.value;
    const lastName = this.contactdetailForm.controls.lastName.value;
    const email = this.contactdetailForm.controls.email.value;
    const address = this.contactdetailForm.controls.address.value;
    const subject = this.contactdetailForm.controls.subject.value;
    const message = this.contactdetailForm.controls.message.value;
    const emailalreadyexist = this.contacts.some(function (el) {
     return el.email === email;
   });
   if (!emailalreadyexist) {

         this.contacts.push({name: firstName + ' ' + lastName, type: type, email: email });
         this.contactdetailForm.reset();
         this.contactdetailModal.close();
   } else {
     this.error = 'Email Already Exists';
     }
   }

   // ------------------------ add youself --------------------- //

   addyourself() {
    let type = this.addyourselfForm.controls.type.value;
    if (type === '') {
    type = 'Remote Signer';
    }
    const firstName = this.addyourselfForm.controls.firstName.value;
    const lastName = this.addyourselfForm.controls.lastName.value;
    const email = this.addyourselfForm.controls.email.value;
    const address = this.addyourselfForm.controls.address.value;
    const subject = this.addyourselfForm.controls.subject.value;
    const message = this.addyourselfForm.controls.message.value;
    const emailalreadyexist = this.contacts.some(function (el) {
     return el.email === email;
   });
   if (!emailalreadyexist) {
    this.http.post('http://localhost:3000/api/addnewparticipant',
      { firstName: firstName, lastName: lastName, email: email, address: address,
        subject: subject, message: message, userId: this.userid })
      .subscribe(data => {
        this.contactList = data;
        if (this.contactList.message === 1) {
         this.contacts.push({name: firstName + ' ' + lastName, type: type, email: email });
         this.addparticipantForm.reset();
         this.addparticipantModal.close();
        } else {
         this.error = 'This Email is already in your Contacts.You can add from there!!!';
        }
      }, err => {
        this.error = 'Something Went Wrong.Please Try Again !!!';
      });
   }  else {
     this.error = 'Email Already Exists';
     }
   }

  logout() {
    this.auth.logout();
  }

}
// @Component({
//   selector: 'app-addparticipant',
//   template: `<h2 mat-dialog-title>Delete all</h2>
//   <mat-dialog-content>Are you sure?</mat-dialog-content>
//   <mat-dialog-actions>
//     <button mat-button mat-dialog-close>No</button>
//     <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
//     <button mat-button [mat-dialog-close]="true">Yes</button>
//   </mat-dialog-actions>`,
// })
// // tslint:disable-next-line:component-class-suffix
// export class AddParticipantDialog {
//   constructor() {}
// }
