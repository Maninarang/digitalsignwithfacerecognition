import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';


@Component({
  selector: 'app-digital-sign',
  templateUrl: './digital-sign.component.html',
  styleUrls: ['./digital-sign.component.css']
})
export class DigitalSignComponent {
    innerHtml: SafeHtml;
    pdfpath: any;
    loading = false;
    files: UploadFile[] = [];
  constructor(private http: HttpClient, private domSanitizer: DomSanitizer) { }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        const file: File = fileList[0];
        const formData: FormData = new FormData();
        this.loading = true;
        formData.append('filetoupload', file, file.name);
        this.http.post('http://localhost:3000/api/uploadfile', formData)
        .subscribe(data => {
            this.pdfpath = data;
            localStorage.setItem('pdfid', this.pdfpath.pdfid);
            this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
                '<object data="' + 'http://localhost:3000' + this.pdfpath.path + '" type="application/pdf" class="embed-responsive-item">' +
                'Object' + this.pdfpath.path + ' failed' +
                '</object>');
                this.loading = false;
          });
    }
}
 showpdf() {
    this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
        '<object data="' + 'http://localhost:3000' + this.pdfpath.path + '" type="application/pdf" class="embed-responsive-item">' +
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
          this.http.post('http://localhost:3000/api/uploadfile', formData)
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

}
