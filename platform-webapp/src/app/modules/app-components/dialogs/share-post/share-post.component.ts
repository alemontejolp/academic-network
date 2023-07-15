import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharePostDialog, SharePostDialogResult } from '../../../classes/dialogs.model';
import { GroupMinInfo } from '../../../classes/academic-network.model';
import { Publication } from '../../../classes/publication.model';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

@Component({
  selector: 'app-share-post',
  templateUrl: './share-post.component.html',
  styleUrls: ['./share-post.component.css']
})
export class SharePostComponent implements OnInit {

  public groups: GroupMinInfo[] = [{
    id: 0,
    name: 'Mi perfil',
    image_src: null,
    description: null
  }];
  public publication: Publication = new Publication();
  public formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<SharePostComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SharePostDialog,
    private academicNetwork: AcademicNetworkService,
    private _formBuilder: FormBuilder,
    private notifications: NotificationsService
  ) { }

  ngOnInit(): void {
    this.setPublication(this.data.postId);
    this.setUserGroups();
    this.formGroup = this._formBuilder.group({
      groupId: ['', Validators.required],
      content: ['']
    });
    this.dialogRef.backdropClick().subscribe(event => {
      let response: SharePostDialogResult = {
        action: 'cancel',
        content: null,
        groupId: null,
        postId: null
      };
      this.dialogRef.close(response);
    });
  }

  setPublication(postId: number): void {
    console.log('requesting original post');
    this.academicNetwork.getPost(postId)
      .subscribe(res => {
        let response: SharePostDialogResult = {
          action: 'cancel',
          content: null,
          groupId: null,
          postId: null
        };
        switch(res.code) {
          case 0:
            this.publication = res.data;
          break;
          case 1:
            this.notifications.info(
              'No autenticado',
              'Debes iniciar sesión para hacer esto');
            this.dialogRef.close(response);
          break;
          case 2:
            this.notifications.info(
              'Prohibido',
              'Esta publicación es de un grupo privado y no perteneces a ese grupo');
            this.dialogRef.close(response);
          break;
          case 3:
            this.notifications.info('No encontrado', 'La publicación que quieres compartir no existe');
            this.dialogRef.close(response);
          break;
        }
      });
  }

  setUserGroups(): void {
    let pageSize = Math.pow(10, 8);
    this.academicNetwork.searchGroups('user', '', pageSize, 0)
      .subscribe(res => {
        if(res.code == 0) {
          this.groups = this.groups.concat(res.data.groups);
        }
      });
  }

  submitHandler(): void {
    this.formGroup.markAllAsTouched()
    if(this.formGroup.valid) {
      let response: SharePostDialogResult = {
        action: 'share',
        content: this.formGroup.get('content').value,
        groupId: this.formGroup.get('groupId').value,
        postId: this.data.postId
      };
      this.dialogRef.close(response);
    } else {
      this.notifications.info(
        'Incompleto',
        'Los campos en rojo son necesarios');
    }
  }

  onCancel(): void {
    let response: SharePostDialogResult = {
      action: 'cancel',
      content: null,
      groupId: null,
      postId: null
    };
    this.dialogRef.close(response);
  }
}
