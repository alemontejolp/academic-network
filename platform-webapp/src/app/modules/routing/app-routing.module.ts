import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../views/login/login.component';
import { SignUpComponent } from '../views/sign-up/sign-up.component';
import { AvailableGroupsComponent } from '../views/available-groups/available-groups.component';
import { MyGroupsComponent } from '../views/my-groups/my-groups.component';
import { UsersComponent } from '../views/users/users.component';
import { FollowersComponent } from '../views/followers/followers.component';
import { FollowingComponent } from '../views/following/following.component';
import { UserFeedComponent } from '../views/user-feed/user-feed.component';
import { PostDetailsComponent } from '../views/post-details/post-details.component';
import { FavoritePostsComponent } from '../views/favorite-posts/favorite-posts.component';
import { ProfileViewComponent } from '../views/profile-view/profile-view.component';
import { GroupComponent } from '../views/group/group.component';
import { CreateNewGroupComponent } from '../views/create-new-group/create-new-group.component';
import { GroupSettingsViewComponent } from '../views/group-settings-view/group-settings-view.component';
import { UserSettingsComponent } from '../views/user-settings/user-settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'users', children: [
    { path: '', component: UsersComponent },
    { path: ':username', children: [
      { path: '', component: ProfileViewComponent },
      { path: 'settings', component: UserSettingsComponent }
    ] }
  ] },
  { path: 'followers', component: FollowersComponent },
  { path: 'following', component: FollowingComponent },
  { path: 'user-feed', component: UserFeedComponent },
  { path: 'post', children: [
    { path: 'favorites', component: FavoritePostsComponent },
    { path: ':id', component: PostDetailsComponent },
  ] },
  { path: 'group', children: [
    { path: 'available', component: AvailableGroupsComponent },
    { path: 'mine', component: MyGroupsComponent },
    { path: 'new', component: CreateNewGroupComponent },
    { path: ':id', children: [
      { path: '', component: GroupComponent },
      { path: 'settings', component: GroupSettingsViewComponent }
    ] }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
