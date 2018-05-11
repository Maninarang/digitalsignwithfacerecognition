import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';
import 'jqueryui';
@Component({
  selector: 'pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css'],

})
export class PdfComponent implements OnInit {
  constructor(private http: HttpClient) {


  }
  loading = true;
  pdfimages= [];
  fileslength: any;

   ngOnInit() {
     $('.pdfimg').addClass('droppable');
    const pdfid = localStorage.getItem('pdfid');
    this.http.post('http://localhost:3000/api/pdfdetail', {pdfid: pdfid})
    .subscribe(data => {
     // this.pdfimages = data;
     let i: number;
     this.fileslength = data;
      for (i = 0; i < this.fileslength.fileslength; i++) {
        this.pdfimages.push('http://localhost:3000/uploadedpdf/' + pdfid  + '/pdf-' + [i] + '.png');
      }
      this.loading = false;
      setTimeout(() => {
        this.adddroppablehandler();
      }, 5000);
    });

  }
adddroppablehandler() {
  $('.draggable').draggable({
    helper: 'clone',
      cursor: 'move'
  });
  $( '.droppable' ).droppable({
    drop: function (event, ui) {
      const $canvas = $(this);
      console.log($canvas);
      console.log($canvas[0]);
      if (!ui.draggable.hasClass('canvas-element')) {
          const $canvasElement = ui.draggable.clone();
          $canvasElement.addClass('canvas-element');
          $canvasElement.draggable({
         //  containment: '#image2'
          });
          $canvas.append($canvasElement);
          // tslint:disable-next-line:max-line-length
          $canvasElement.append('<div class="borderrs" style="border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;-webkit-border-radius: 5px 5px 5px 5px;border: 3px solid black;margin-left: 3px;min-width: 280px;width: 150px;height: 45px;"><div style="word-wrap: break-word; text-align: left; font-family: Cursive, Sans-Serif; font-size: 24px; font-weight: 400; font-style: italic; color: rgb(20, 83, 148);"><div id="signtypeval5" style="height: 35px; width: auto; ">Testing</div></div></div>');
          console.log('full- ' + ui.position);
          console.log('left- ' + ui.position.left);
          console.log('top- ' + ui.position.top);
          $canvasElement.css({
              left: (ui.position.left / 2),
              top: ( $canvas[0].offsetHeight + ui.position.top) * 2,
              position: 'absolute'
          });
      }
  }
});
}

}
