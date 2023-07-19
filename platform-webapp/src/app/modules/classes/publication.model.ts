export class Comment {
  post_id: number;
  comment_id: number;
  user_id: number;
  firstname: string;
  lastname: string;
  username: string;
  profile_img_src: string;
  content: string;
  image_src: string;
  created_at: string;
}

export class Publication {
  id: number;
  user_id: number;
  username: string = '';
  firstname: string = '';
  lastname: string = '';
  profile_img_src: string;
  content: string = '';
  img_src: string;
  post_type: string;
  like_counter: number;
  created_at: string;
  liked_by_user: boolean;
  group_name: string;
  group_id: number;
  referenced_post: Publication;
}
