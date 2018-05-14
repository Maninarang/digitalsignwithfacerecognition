import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { DigitalSignatureComponent } from './signature/DigitalSignature.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AuthenticationService } from './authentication.service';
import { AuthGuardService } from './auth-guard.service';
import { WebcamModule } from 'ngx-webcam';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfComponent } from './pdf/pdf.component';
import { FileDropModule } from 'ngx-file-drop';
import { DragndropComponent } from './dragndrop/dragndrop.component';
import { LoadingModule } from 'ngx-loading';
import {DatePipe} from '@angular/common';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { ActionrequestComponent } from './actionrequest/actionrequest.component';
import { DigitalSignComponent } from './digital-sign/digital-sign.component';
import { SavedImageComponent } from './saved-image/saved-image.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { CompletedComponent } from './completed/completed.component';
import { NgxCarouselModule } from 'ngx-carousel';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SignpdfComponent } from './signpdf/signpdf.component';









const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'digitalsignature', component: DigitalSignatureComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'pdfsign', component: PdfComponent, canActivate: [AuthGuardService] },
  { path: 'dnd', component: DragndropComponent },
  { path: 'actionrequest', component: ActionrequestComponent },
  { path: 'digital_sign', component: DigitalSignComponent, canActivate: [AuthGuardService]},
  { path: 'saved_image', component: SavedImageComponent },
  { path: 'contact_list', component: ContactListComponent },
  { path: 'completed', component: CompletedComponent },
  { path: 'signpdf/:userid/:documentid', component: SignpdfComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HeaderComponent,
    DigitalSignatureComponent,
    PdfComponent,
    DragndropComponent,
    ActionrequestComponent,
    DigitalSignComponent,
    SavedImageComponent,
    ContactListComponent,
    CompletedComponent,
    SignpdfComponent
    ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    WebcamModule,
    PdfViewerModule,
    FileDropModule,
    LoadingModule,
    NgxCarouselModule,
    DragAndDropModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [
    AuthenticationService,
    AuthGuardService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
