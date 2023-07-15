import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageSquareCropper } from '../../../classes/dialogs.model';
import { CropperComponent } from 'angular-cropperjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-image-square-cropper',
  templateUrl: './image-square-cropper.component.html',
  styleUrls: ['./image-square-cropper.component.css']
})
export class ImageSquareCropperComponent implements OnInit {
  @ViewChild('angularCropper') angularCropper: CropperComponent;
  public cropperjsOptions = {
    aspectRatio: 1 / 1
  };

  constructor(
    private dialogRef: MatDialogRef<ImageSquareCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageSquareCropper,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  applyHandler() {
    this.angularCropper
      .cropper.getCroppedCanvas().toBlob(image => {
        let objectURL = URL.createObjectURL(image);
        let trustedUrl = this.sanitizer.bypassSecurityTrustUrl(
          objectURL) as string;
        this.dialogRef.close({
          image: image,
          imageTrustedUrl: trustedUrl
        });
      }, 'image/jpeg', 1);
  }
}
