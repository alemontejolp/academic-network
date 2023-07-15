//Angular dependencies
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

//Components
import { SharePostComponent } from 'src/app/modules/app-components/dialogs/share-post/share-post.component';

//Clases
import { Publication } from 'src/app/modules/classes/publication.model';
import { SharePostDialogResult, SharePostDialog } from 'src/app/modules/classes/dialogs.model';

//Services
import { AcademicNetworkService } from '../academic-network/academic-network.service';
import { AnimationsService } from '../animations/animations.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(
    private dialog: MatDialog,
    private academicNetwork: AcademicNetworkService,
    private animations: AnimationsService,
    private notifications: NotificationsService
  ) { }

  /**
   * Start the dialog to share a post, and if the user proceed with the sharing,
   * this methods creates the post in the system, show the result messages in
   * notifications and return the new post created.
   * 
   * @param data An object that contains
   * - publicationId: int. The id of the post to share.
   * @returns Observable<Publication>
   */
  startProcessToSharePost(data) {
    return new Observable<Publication>((observer: Observer<Publication>) => {
      const sharePostDialog = this.dialog.open(SharePostComponent, {
        width: '700px',
        data: { postId: data.publicationId }
      });
  
      sharePostDialog.afterClosed().subscribe((result: SharePostDialogResult) => {
        console.log(result);
        if(result.action == 'share') {
          this.animations.globalProgressBarActive = true;
          let postData = {
            content: result.content,
            referenced_post_id: result.postId
          };
          this.academicNetwork.sharePost(postData, result.groupId)
            .subscribe(res => {
              this.animations.globalProgressBarActive = false;
              console.log(res);
              switch(res.code) {
                case 0:
                  observer.next(res.data);
                  this.notifications.success(
                    'Compartido',
                    'Se ha compartido la publicación');
                break;
                case 1:
                  if(result.groupId == 0) {
                    this.notifications.info(
                      'No se pudo compartir',
                      'No se enviaron datos para compartir');
                  } else {
                    this.notifications.info(
                      'No se pudo compartir',
                      'El grupo no existe');
                  }
                break;
                case 2:
                  if(result.groupId == 0) {
                    this.notifications.info(
                      'No se pudo compartir',
                      'El post pertenece a un grupo privado');
                  } else {
                    this.notifications.info(
                      'No se pudo compartir',
                      'El grupo no tiene permiso para publicar');
                  }
                break;
                case 3:
                  this.notifications.info(
                    'No se pudo compartir',
                    'No se enviaron datos para compartir');
                break;
                case 4:
                  this.notifications.info(
                    'No se pudo compartir',
                    'No eres miembro del grupo');
                  break;
                case 5:
                  this.notifications.info(
                    'No se pudo compartir',
                    'El post pertenece a un grupo privado');
                break;
              }
            });
        }
      });
    });
  }
}
