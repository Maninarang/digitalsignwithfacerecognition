import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-documentdetail',
  templateUrl: './documentdetail.component.html',
  styleUrls: ['./documentdetail.component.css']
})
export class DocumentdetailComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      const documentid = params['documentid'];
     this.http.get('http://localhost:3000/documentdetail/' + documentid)
     .subscribe(data => {
       console.log(data);
     });
        });
  }

}
