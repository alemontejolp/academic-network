import { Publication, Comment } from "./publication.model";

export class Response<T> {
  code: number;
  data: T;
  messages: string[];
}

export class UserPublicData {
  username: string;
  firstname: string;
  lastname: string;
  description: string;
  profile_img_src: string;
  created_at: string;
  type_user: string;
  major: string;
}

export class SigninData {
  username: string;
  firstname: string;
  lastname: string;
  description: string;
  profile_img_src: string;
  created_at: string;
  type_user: string;
  major: string;
  session_token: string;
}

export class UserTimeline {
  posts: Publication[];
  total_records: number;
}

export class GroupTag {
  tag: string;
}

export class AvailableGroupPermission {
  id: number;
  name: string;
  codename: string;
}

export class GroupPermission extends AvailableGroupPermission {
  granted: number;
}

export class GroupData {
  owner_firstname: string;
  owner_lastname: string;
  owner_username: string;
  owner_profile_img_src: string;
  group_name: string;
  group_image_src: string;
  group_description: string;
  group_visibility: string;
  group_created_at: string;
}

export class GroupInformation {
  group_data: GroupData;
  permissions: GroupPermission[];
  tags: GroupTag[];
}

export class CommentsOfPost {
  comments: Comment[];
  total_records: number;
}

export class CreateGroup {
  group_id: number;
}

export class GroupImage {
  image_src: string;
}

export class PermissionsForGroups {
  group_permissions: AvailableGroupPermission[];
}

export class GroupMinInfo {
  id: number;
  name: string;
  image_src: string;
  description: string;
}

export class GroupSearching {
  groups: GroupMinInfo[];
  total_records: number;
}

export class UserMinInfo {
  username: string;
  firstname: string;
  lastname: string;
  profile_img_src: string;
}

export class UserSearching {
  users: UserMinInfo[];
  total_records: number;
}

export class MembershipInformation {
  is_member: boolean;
  is_owner: boolean;
  active_notifications: boolean;
  created_at: string;
}

export class GroupPosts {
  group_posts: Publication[];
  total_records: number;
}

export class FavoritePosts {
  favorite_posts: Publication[];
  total_records: number;
}

export class UserPosts {
  posts: Publication[];
  total_records: number;
}
