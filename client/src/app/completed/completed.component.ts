import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, UserDetails, TokenPayload} from '../authentication.service';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.css']
})
export class CompletedComponent implements OnInit {
  details: UserDetails;
  fullname: String;
  userid: String;
  email: String;
  documents: any;
  users: any;
  documentdetail: any;
  constructor(
   private http: HttpClient,
   private auth: AuthenticationService
 ) { }
  // constructor() { }

  ngOnInit() {
    console.log('CompletedComponent loaded');
    this.auth.profile().subscribe(user => {
      this.details = user;
      this.email = this.details.email;
      this.fullname = this.details.name;
      this.userid = this.details._id;
      // console.log(this.userid);
      this.http.get('http://localhost:3000/api/mycompleteddocuments/' + this.userid)
      .subscribe(data => {
       this.documentdetail = data;
       this.documents = this.documentdetail.data;
      //  console.log(this.documents.length);
      //  this.users = this.documentdetail.data.user;
       console.log(this.documents);
     //  console.log(this.documents[0]);
      });
    });
  }

}
