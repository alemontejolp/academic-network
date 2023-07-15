import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImageSquareCropperComponent } from '../../app-components/dialogs/image-square-cropper/image-square-cropper.component';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.css']
})
export class ImagePickerComponent implements OnInit {
  @Input() cropImageIndication: string = 'Recorta tu imagen.';
  @Input() applyBtnDisabled: boolean = false;
  @Input() applyBtnLabel: string = 'Aplicar';
  @Input('formGroup') imageFormGroup: FormGroup;
  @Input() card: ElementCard;
  @Output() apply: EventEmitter<any> = new EventEmitter<any>();
  public imageSelected: string;

  constructor(
    private sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if(!this.imageFormGroup) {
      this.imageFormGroup = this._formBuilder.group({
        imageCtrl: ['', Validators.required]
      })
    }

    if(!this.card) {
      this.card = {
        icon: '/assets/people-black-18dp.svg',
        text: [],
        internalLink: null,
        externalLink: null
      }
    }
  }

  imageChangeHandler(event) {
    let image = event.target.files[0];
    if(image) {
      let objectURL = URL.createObjectURL(image);
      let trustedUrl = this.sanitizer.bypassSecurityTrustUrl(
        objectURL) as string;
      this.imageSelected = trustedUrl;

      //Execute the dialog here.
      const dialogRef = this.dialog.open(ImageSquareCropperComponent, {
        width: '600px',
        data: {
          title: this.cropImageIndication,
          imageSelected: this.imageSelected,
          applyBtnDisabled: this.applyBtnDisabled,
          applyBtnLabel: this.applyBtnLabel
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.card.icon = result.imageTrustedUrl;
          this.apply.emit({
            image: result.image,
            invalid: this.imageFormGroup.invalid
          });
        }
      });
    }
  }

  selectImageHandler(imageInput) {
    imageInput.value = '';
    imageInput.click();
  }
}
