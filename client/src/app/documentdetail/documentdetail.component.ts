import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-documentdetail',
  templateUrl: './documentdetail.component.html',
  styleUrls: ['./documentdetail.component.css']
})
export class DocumentdetailComponent implements OnInit {
  documents: any;
  documentdetail: any;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
      // console.log(params);
     this.http.get('http://localhost:3000/api/documentdetail/' + documentid)
     .subscribe(data => {
       console.log(data);
       this.documentdetail = data;
       this.documents = this.documentdetail.data;
     });
        });
  }

}
