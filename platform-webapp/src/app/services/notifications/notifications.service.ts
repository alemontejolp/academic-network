import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private toastr: ToastrService
  ) { }

  info(title: string, message: string, options?) {
    return this.toastr.info(message, title, options);
  }

  success(title: string, message: string, options?) {
    return this.toastr.success(message, title, options);
  }

  error(title: string, message: string, options?) {
    return this.toastr.error(message, title, options);
  }

  warning(title: string, message: string, options?) {
    return this.toastr.warning(message, title, options);
  }

}
