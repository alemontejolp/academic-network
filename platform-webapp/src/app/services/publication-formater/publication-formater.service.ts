import { Injectable } from '@angular/core';
import { Publication } from 'src/app/modules/classes/publication.model';

@Injectable({
  providedIn: 'root'
})
export class PublicationFormaterService {

  constructor() { }

  isSharedContent(p: Publication) {
    return p.referenced_post != null;
  }

  getReferencedField(p: Publication, field: string) {
    if(this.isSharedContent(p)) {
      switch(field) {
        case 'profile_name':
          let data;
          data = p.referenced_post.firstname + ' ';
          data += p.referenced_post.lastname;
          return data;

        default:
          return p.referenced_post[field];
      }
    }

    return null;
  }

}
