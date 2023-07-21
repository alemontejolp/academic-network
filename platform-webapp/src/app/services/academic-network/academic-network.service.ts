import { Injectable } from '@angular/core';
import { Student } from '../../modules/classes/student.model';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { apikey, domain} from '../../../environments/environment';
import * as ans from '../../modules/classes/academic-network.model';
import { SessionService } from '../session/session.service';
import { Publication, Comment } from 'src/app/modules/classes/publication.model';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class AcademicNetworkService {

  constructor(
    private http: HttpClient,
    private session: SessionService,
    private notifications: NotificationsService
  ) { }

  private handleError<T>(operation) {

    return (error: HttpErrorResponse): Observable<T> => {

      if (error.status === 0) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error);
        this.notifications.error('Error', 'Oops. Parece haber un problema de red.');
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        console.error(
          `Backend returned code ${error.status}, body was: `, error.error);
        // TODO: better job of transforming error for user consumption
        console.error(
          `${operation} failed: ${error.message}`);
        let nofitOptions = { disableTimeOut: true }
        switch(error.error.code) {
          case -2: //User token expired.
            this.notifications.warning(
              'Advertencia',
              'Tu sesión ha expirado. Vuelve a iniciar sesión.',
              nofitOptions);
            break;
          case -3: //User authentication (token) not valid.
            this.notifications.error(
              'Error',
              'Qué pena. :c El identificador de sesión no es válido. ' +
              'No te preocupes, no es tu culpa. ' +
              'Por favor, reporta este error.',
              nofitOptions);
            break;
          case -4: //Application not allowed to use the service.
            this.notifications.error(
              'Error',
              'Qué pena. :c Esta aplicación no esta autorizada para usar el sistema. ' +
              'No te preocupes, no es tu culpa. ' +
              'Por favor, reporta este error.',
              nofitOptions);
            break;
          case -5: //An unknown error. Check log/crash_reports.log and API log files to see what happened.
            this.notifications.error(
              'Error',
              'Qué pena, algo extraño paso. :c No te preocupes, no es tu culpa. ' +
              'Por favor, reporta este error.',
              nofitOptions);
            break;
          case 1000: //RSA keys were not found when trying to sign o verify a token.
            this.notifications.error(
              'Error fatal',
              'Qué pena, algo no está bien. :c No te preocupes, no es tu culpa. ' +
              'Por favor, reporta el siguiente código de error: 1000.');
            break;
          case 1001: //Cloudinary credentials were not found when trying to use endpoints which use Cloudinary services.
            this.notifications.error(
              'Error fatal',
              'Qué pena, algo no está bien. :c No te preocupes, no es tu culpa. ' +
              'Por favor, reporta el siguiente código de error: 1001.');
            break;
        }
      }

      // Let the app keep running by returning an empty result.
      return of(error.error as T);
      // Return an observable with a user-facing error message.

      //return throwError(
      //  'Something bad happened; please try again later.');
    };

  }

  //Métodos.
  getCareers(): Observable<any> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json'
    });

    return this.http.get(
      `${domain}/v1/api/social-network/users/majors`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<any>('Get Careers')));
  }

  addNewStudent(student: Student) {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${domain}/v1/api/social-network/users/signup`,
      student,
      { headers: headers })
        .pipe(catchError(
          this.handleError<any>('Add New Student')));
  }

  getUserTypes(): Observable<any> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json'
    });

    return this.http.get(
      `${domain}/v1/api/social-network/users/types`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<any>('Get User Types')));
  }

  getUserPublicData(username): Observable<ans.Response<ans.UserPublicData>> {
    let authToken = this.session.getToken();
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json'
    });
    if (authToken) {
      headers = headers.set('Authorization', authToken);
    }

    return this.http.get<ans.Response<ans.UserPublicData>>(
      `${domain}/v1/api/social-network/users/data/${username}`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.UserPublicData>>('Get User Public Data')));
  }

  signin(username, passwd): Observable<ans.Response<ans.SigninData>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json'
    });

    let user = {
      username,
      passwd
    };

    return this.http.post<ans.Response<ans.SigninData>>(
      `${domain}/v1/api/social-network/users/signin`,
      user,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.SigninData>>('Signin')));
  }

  getUserTimeline(offset: number = 20, page: number = 0): Observable<ans.Response<ans.UserTimeline>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('page', page.toString());

    return this.http.get<ans.Response<ans.UserTimeline>>(
      `${domain}/v1/api/social-network/posts/timeline`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.UserTimeline>>('Get User User Timeline')));
  }

  getGroupInformation(groupId): Observable<ans.Response<ans.GroupInformation>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    return this.http.get<ans.Response<ans.GroupInformation>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/information`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.GroupInformation>>('Get Group Information')));
  }

  getPost(postId): Observable<ans.Response<Publication>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    return this.http.get<ans.Response<Publication>>(
      `${domain}/v1/api/social-network/posts/post/${postId}`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Publication>>('Get Post')));
  }

  getCommentsOfPost(postId, offset = 20, page = 0): Observable<ans.Response<ans.CommentsOfPost>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('page', page.toString());

    return this.http.get<ans.Response<ans.CommentsOfPost>>(
      `${domain}/v1/api/social-network/posts/post/${postId}/comments`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.CommentsOfPost>>('Get Comments of Post')));
  }

  /**
   *
   * @param groupData Ab object containing:
   * group_name: string. The name of the group.
   * description: string. Group description, optional.
   * visibility: string. If public or private. Posible values [public|private]
   * permissions: Array<int>. An array of permission ids. See here to request available permissions.
   * tags: Array<string>. An array of strings representing tags that will be used to appear in searches
   * @returns Observable<ans.Response<ans.CreateGroup>>
   */
  createGroup(groupData): Observable<ans.Response<ans.CreateGroup>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    return this.http.post<ans.Response<ans.CreateGroup>>(
      `${domain}/v1/api/social-network/groups/create`,
      groupData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.CreateGroup>>('Create Group')));
  }

  updateGroupImage(groupId, image): Observable<ans.Response<ans.GroupImage>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let groupData = new FormData();
    groupData.append('image', image);

    return this.http.put<ans.Response<ans.GroupImage>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/update-image`,
      groupData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.GroupImage>>('Update Group Image')));
  }

  getAvailableGroupPermissions(): Observable<ans.Response<ans.PermissionsForGroups>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
    });

    return this.http.get<ans.Response<ans.PermissionsForGroups>>(
      `${domain}/v1/api/social-network/groups/available-permissions`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.PermissionsForGroups>>('Get Available Group Permissions')));
  }

  searchGroups(type = 'all', search = '', offset = 10, page = 0, asc = 1): Observable<ans.Response<ans.GroupSearching>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('group_relative_type', type)
      .set('search', search)
      .set('offset', offset.toString())
      .set('page', page.toString())
      .set('asc', asc.toString());

    return this.http.get<ans.Response<ans.GroupSearching>>(
      `${domain}/v1/api/social-network/groups/search`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.GroupSearching>>('Search Groups')));
  }

  searchUsers(type = 'all', search = '', offset = 10, page = 0, asc = 1): Observable<ans.Response<ans.UserSearching>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('user_relative_type', type)
      .set('search', search)
      .set('offset', offset.toString())
      .set('page', page.toString())
      .set('asc', asc.toString());

    return this.http.get<ans.Response<ans.UserSearching>>(
      `${domain}/v1/api/social-network/users/search`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.UserSearching>>('Search Users')));
  }

  /**
   * Creates a new user post.
   * @param postData An object that contains.
   * - content: string.
   * - image: blob.
   * - referenced_post_id: number.
   * @returns
   */
  createUserPost(postData): Observable<ans.Response<Publication>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = new FormData();
    if(postData.content)
      formData.append('content', postData.content);
    if(postData.image)
      formData.append('image', postData.image);
    if(postData.referenced_post_id)
      formData.append('referenced_post_id', postData.referenced_post_id)

    return this.http.post<ans.Response<Publication>>(
      `${domain}/v1/api/social-network/users/post`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Publication>>('Create User Post')));
  }

  swicthGroupNotifications(groupId: number, state: number): Observable<ans.Response<Object>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = {
      state
    };

    return this.http.put<ans.Response<Object>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/switch-notifications`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Object>>('Switch Group Notifications')));
  }

  getMembershipInfo(groupId: number): Observable<ans.Response<ans.MembershipInformation>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    return this.http.get<ans.Response<ans.MembershipInformation>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/membership-info`,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.MembershipInformation>>('Get Membership Information')));
  }

  getGroupPosts(groupId: number, offset: number = 20, page: number = 0): Observable<ans.Response<ans.GroupPosts>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('page', page.toString());

    return this.http.get<ans.Response<ans.GroupPosts>>(
      `${domain}/v1/api/social-network/posts/group/${groupId}`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.GroupPosts>>('Get Group Posts')));
  }

  getFavoritePosts(offset: number = 20, page: number = 0): Observable<ans.Response<ans.FavoritePosts>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('page', page.toString());

    return this.http.get<ans.Response<ans.FavoritePosts>>(
      `${domain}/v1/api/social-network/posts/favorite`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.FavoritePosts>>('Get Favorite Posts')));
  }

  /**
   * Creates a new post of group.
   * @param postData An object that contains.
   * - content: string.
   * - image: blob.
   * - referenced_post_id: number.
   * @returns
   */
   createGroupPost(postData, groupId): Observable<ans.Response<Publication>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = new FormData();
    if(postData.content)
      formData.append('content', postData.content);
    if(postData.image)
      formData.append('image', postData.image);
    if(postData.referenced_post_id)
      formData.append('referenced_post_id', postData.referenced_post_id)

    return this.http.post<ans.Response<Publication>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/post`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Publication>>('Create Post of Group')));
  }

  /**
   * Creates a new post of group.
   * @param postData An object that contains.
   * - content: string.
   * - referenced_post_id: number.
   * @returns Observable<ans.Response<Publication>>
   */
  sharePost(postData, groupId): Observable<ans.Response<Publication>> {
    if (groupId == 0) { //User-level post.
      return this.createUserPost(postData);
    } else { //Group-level post.
      return this.createGroupPost(postData, groupId);
    }
  }

  getPostsOfUser(target_username: string, offset: number = 20, page: number = 0): Observable<ans.Response<ans.UserPosts>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('page', page.toString());

    return this.http.get<ans.Response<ans.UserPosts>>(
      `${domain}/v1/api/social-network/posts/user/${target_username}`,
      { headers: headers, params: params })
        .pipe(catchError(
          this.handleError<ans.Response<ans.UserPosts>>('Get Posts Of a User')));
  }

  setFollowerFor(username: string, action: string): Observable<ans.Response<Object>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Content-Type': 'application/json',
      'Authorization': this.session.getToken()
    });

    return this.http.post<ans.Response<Object>>(
      `${domain}/v1/api/social-network/users/set-follower-for/${username}/${action}`,
      {},
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Object>>('setFollowerFor')));
  }

  updateProfileImage(image): Observable<ans.Response<ans.GroupImage>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let groupData = new FormData();
    groupData.append('image', image);

    return this.http.put<ans.Response<ans.ProfileImage>>(
      `${domain}/v1/api/social-network/users/update-profile-image`,
      groupData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<ans.GroupImage>>('Update Group Image')));
  }

  setFavoriteStatus(postId: number, action: string): Observable<ans.Response<Object>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = {}

    return this.http.put<ans.Response<Object>>(
      `${domain}/v1/api/social-network/posts/set-like/${postId}/${action}`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Object>>('Set like')));
  }

  createCommentInUserPost(postId, comment, image = null): Observable<ans.Response<Comment>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('content', comment)

    return this.http.post<ans.Response<Comment>>(
      `${domain}/v1/api/social-network/users/post/${postId}/make-comment`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Comment>>('Create a comment in a user post')));
  }

  createCommentInGroupPost(postId, comment, image = null): Observable<ans.Response<Comment>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    let formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('content', comment)

    return this.http.post<ans.Response<Comment>>(
      `${domain}/v1/api/social-network/groups/post/${postId}/make-comment`,
      formData,
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Comment>>('Create a comment in a user post')));
  }

  addCurrentUserToGroup(groupId): Observable<ans.Response<Object>> {
    let headers = new HttpHeaders({
      'x-api-key': apikey,
      'Authorization': this.session.getToken()
    });

    return this.http.post<ans.Response<Object>>(
      `${domain}/v1/api/social-network/groups/group/${groupId}/add-user`,
      {},
      { headers: headers })
        .pipe(catchError(
          this.handleError<ans.Response<Object>>('Add current user to a group')));
  }
}
