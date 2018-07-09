import { Component, OnInit } from '@angular/core';
import { VERSION } from '@angular/core';
import * as dwv from '../../assets/dwv';

// gui overrides

// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;
// progress
dwv.gui.displayProgress = function () {};
// window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize;
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// refresh element
dwv.gui.refreshElement = dwv.gui.base.refreshElement;

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    'jpeg2000': 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js',
    'jpeg-lossless': 'assets/dwv/decoders/rii-mango/decode-jpegloss.js',
    'jpeg-baseline': 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js'
};

@Component({
  selector: 'app-dicomviewer',
  templateUrl: './dicomviewer.component.html',
  styleUrls: ['./dicomviewer.component.css']
})
export class DicomviewerComponent implements OnInit {


  public legend: string;
  public loaded: number ;
  private dwvApp: any;
  public loading = false;
  constructor() {
    this.legend = 'Powered by dwv ' + dwv.getVersion() + ' and Angular ' + VERSION.full;
    this.loaded = 0;
  }
  ngOnInit() {
    // create app
    this.dwvApp = new dwv.App();
    // initialise app
    this.dwvApp.init({
      'containerDivId': 'dwv',
      'fitToWindow': true,
      'tools': ['Scroll', 'WindowLevel', 'ZoomAndPan', 'Draw'],
      'shapes': ['Ruler'],
      'isMobile': true
    });
    // progress
    const self = this;
    this.dwvApp.addEventListener('load-progress', function (event) {
      self.loaded = event.loaded; 
     if(self.loaded == 100) {
       self.loading = false;
     }
    });
  }
  // onClick = function (event) {
  //   if ( this.dwvApp ) {
  //       this.dwvApp.onChangeTool(event);
  //   }
  // };

  fileChange(event) {
  this.loading = true;  
  // event.target.files;
  if ( this.dwvApp ) {
  var getimage=this.dwvApp.onUploadFile(event);
 
  }
}
}
