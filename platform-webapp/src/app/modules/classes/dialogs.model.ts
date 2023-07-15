export class GroupPreferences {
  listenForNotifications: boolean;

  constructor(
    notif: boolean = true
  ) {
    this.listenForNotifications = notif;
  }

  public clone(): GroupPreferences {
    let newInstance = new GroupPreferences(
      this.listenForNotifications
    )
    return newInstance;
  }
}

export class ImageSquareCropper {
  public title: string;
  public imageSelected: string;
  public applyBtnDisabled: boolean;
  public applyBtnLabel: string;
}

export class SharePostDialog {
  postId: number;
}

export class SharePostDialogResult {
  action: string;
  groupId: number;
  content: string;
  postId: number;
}
