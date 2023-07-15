import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-and-image-form',
  templateUrl: './text-and-image-form.component.html',
  styleUrls: ['./text-and-image-form.component.css']
})
export class TextAndImageFormComponent implements OnInit {

  @Input() textInputLabel: string;
  @Input() textInputPlaceholder: string;
  @Output() newContent: EventEmitter<any> = new EventEmitter();

  public textInputId: string;

  @Input() set focusInput(val) {
    let input = document.getElementById(this.textInputId)
    if(input) {
      input.focus();
    }
  }

  constructor() { }

  ngOnInit(): void {
    let randId = Math.round(Math.random() * Math.pow(10, 10))
    this.textInputId = '__text_input_' + randId.toString();
    console.log('text input id', this.textInputId);
  }

  setTextareSize(element) {
    element.style.overflow = 'hidden';
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight + 10) + 'px'
  }

  typingHandlerForTextbox(textField, imageField, imagePreview, event) {
    //13 is the ASCII code for "return".
    if(event.keyCode == 13 && event.shiftKey) {
      //Send text and image if exists.
      this.sendContent(textField, imageField, imagePreview)
    }
    this.setTextareSize(textField)
  }

  imageInputHandler(imageInput, imagePreview) {
    let files = imageInput.files;
    if (!files || !files.length) {
      imagePreview.src = '';
      return;
    }

    let firstFile = files[0];
    let objectURL = URL.createObjectURL(firstFile);
    console.log(objectURL)
    imagePreview.src = objectURL;
  }

  sendContent(textField, imageField, imagePreview) {
    let text = textField.value.trim();
    let image = imageField.files[0];
    textField.value = '';
    imageField.value = '';
    imagePreview.src = '';

    this.newContent.emit({
      text,
      image
    })
  }

  handlerForSendContentBtn(textField, imageField, imagePreview) {
    this.sendContent(textField, imageField, imagePreview)
    this.setTextareSize(textField)
  }

}
