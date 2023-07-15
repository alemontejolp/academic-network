import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopupsService } from 'src/app/services/popups/popups.service';

@Component({
  selector: 'app-single-field-form-n2options',
  templateUrl: './single-field-form-n2options.component.html',
  styleUrls: ['./single-field-form-n2options.component.css']
})
export class SingleFieldFormN2optionsComponent implements OnInit {

  @Input('label') label;
  @Input('placeholder') plh;
  @Input('left-btn') lbtn;
  @Input('right-btn') rbtn;
  @Input('type') type;
  @Input('required') isreq:boolean;
  @Input('forward-btn') forward_btn;
  @Input('error-msg') footer;

  @Output('btn-pressed') btn_pressed: EventEmitter<any> = new EventEmitter();

  constructor(private popups: PopupsService) { }

  ngOnInit(): void {
  }

  onkeyup(event, val) {
    console.log(event)
    if(event.charCode == 13) {
      this.onclick(event, val, 'return')
    }
  }

  onclick(event, val, btn) {
    event.preventDefault();

    //Evitar la ejecución del flujo si el campo es
    //requerido y está vacío.
    if(!val && this.isreq && (btn == this.forward_btn || btn == 'return')) {
      this.popups.error('Error', `El campo ${this.label} es requerido.`, this.footer);
      return;
    }

    this.btn_pressed.emit({
      value: val,
      btn: btn
    });

  }

}
