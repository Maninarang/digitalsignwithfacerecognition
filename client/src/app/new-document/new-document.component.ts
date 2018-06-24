import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.css']
})
export class NewDocumentComponent implements OnInit {
  hide: any;
  hideme:any;
  constructor() { }

  ngOnInit() {
  }
  hideshow() {
    if (this.hide == null) {
      this.hide = 'hide';

    } else {
      this.hide = null;
    }
  }
  hidealso() {
    if (this.hideme == null) {
      this.hideme = 'hide';

    } else {
      this.hideme = null;
    }
  }
}
