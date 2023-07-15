import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  public globalProgressBarActive: boolean = false;

  constructor() { }
}
