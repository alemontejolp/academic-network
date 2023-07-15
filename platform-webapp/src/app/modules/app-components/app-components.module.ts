//Modules
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material/material.module'; //All material design modules to be used.
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularCropperjsModule } from 'angular-cropperjs';

//Components
import { SingleFieldFormN2optionsComponent } from './single-field-form-n2options/single-field-form-n2options.component';
import { ElementCardComponent } from './element-card/element-card.component';
import { ElementCardBoxComponent } from './element-card-box/element-card-box.component';
import { PublicationCardComponent } from './publication-card/publication-card.component';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { TextAndImageFormComponent } from './text-and-image-form/text-and-image-form.component';
import { PublicationDisplayComponent } from './publication-display/publication-display.component';
import { GroupSettingsComponent } from './group-settings/group-settings.component';
import { ImagePickerComponent } from './image-picker/image-picker.component';

//Dialogs
import { GroupPreferencesComponent } from './dialogs/group-preferences/group-preferences.component';
import { ImageSquareCropperComponent } from './dialogs/image-square-cropper/image-square-cropper.component';
import { SharePostComponent } from './dialogs/share-post/share-post.component';

let components = [
  //Components
  SingleFieldFormN2optionsComponent,
  ElementCardComponent,
  ElementCardBoxComponent,
  PublicationCardComponent,
  CommentBoxComponent,
  TextAndImageFormComponent,
  PublicationDisplayComponent,
  GroupSettingsComponent,
  ImagePickerComponent,

  //Dialogs
  GroupPreferencesComponent,
  ImageSquareCropperComponent,
  SharePostComponent
]

let externalModules = [
  CommonModule,
  MaterialModule,
  FormsModule,
  ReactiveFormsModule,
  AngularCropperjsModule
]

@NgModule({
  declarations: components,
  imports: externalModules,
  exports: [
    components,
    externalModules
  ]
})
export class AppComponentsModule { }
