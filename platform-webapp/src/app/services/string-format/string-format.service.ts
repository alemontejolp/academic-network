import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class StringFormatService {

  constructor() { }

  public splitByEOL(text): Array<string> {
    let splitedByLines = text.split('\n')
    for (let j = 0; j < splitedByLines.length; j++) {
      if(splitedByLines[j] == '') {
        splitedByLines.splice(j, 1);
        j -= 1;
      }
    }

    return splitedByLines;
  }

  dateFormat(date) {
    /*
    let momentDate = moment(date).format('DD-MMMM-YYYY')
      .split('-');
    return `${momentDate[0]} de ${momentDate[1]} de ${momentDate[2]}`;
    */
    return moment(date).format('MMMM DD, YYYY');
  }
}
