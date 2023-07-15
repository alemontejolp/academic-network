import { Component, OnInit } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { Publication } from '../../classes/publication.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { PopupsService } from 'src/app/services/popups/popups.service';
import { SessionService } from 'src/app/services/session/session.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { AnimationsService } from 'src/app/services/animations/animations.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {

  public user: ElementCard = new ElementCard();
  public profileDefaultIcon: string = "/assets/account_circle-black-18dp.svg";
  public publications: Publication[] = [];
  public displayPublicationForm: boolean;

  constructor(
    public router: Router,
    private academicNetwork: AcademicNetworkService,
    private route: ActivatedRoute,
    private popups: PopupsService,
    private session: SessionService,
    private notifications: NotificationsService,
    private animations: AnimationsService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.route.params.subscribe(params => {
      let username = params['username'];
      this.academicNetwork
        .getUserPublicData(username)
          .subscribe(res => {
            console.log(res)
            if(res.code == 0) {
              this.setUserData(res.data);
              this.updatePublicationForm(res.data.username);
            } else if(res.code == 1) {
              this.popups.error(
                'El usuario no existe.',
                'Si llegasta hasta aquí a través de una URL,' +
                ' revisa si el nombre de usario de la URL es correcto.');
            }
          });
    });

    this.publications = [
      {
        id: 1112,
        user_id: 1256,
        username: 'cheems',
        firstname: 'Cheems',
        lastname: 'Balltze',
        profile_image_src: 'https://holatelcel.com/wp-content/uploads/2020/09/cheems-memes-9.jpg',
        content: 'Me da amsiedad escribir descipciones feik uwu',
        img_src: 'http://holatelcel.com/wp-content/uploads/2020/09/cheems-memes-8.jpg',
        post_type: 'shared',
        like_counter: 256,
        created_at: '2020/06/03',
        liked_by_user: null,
        group_name: 'Data Engineering',
        group_id: 12312,
        referenced_post: {
          user_id: 1212133,
          id: 1444,
          username: 'alecito',
          firstname: 'Alexis',
          lastname: 'Montejo',
          profile_image_src: 'https://avatars1.githubusercontent.com/u/33400166?s=96&v=4',
          content: 'jsjsjsjs así es xdd',
          img_src: 'https://i1.wp.com/noticieros.televisa.com/wp-content/uploads/2021/03/meme1.jpg?resize=1103%2C943&ssl=1',
          post_type: 'user',
          like_counter: 700,
          created_at: '2020/01/01',
          liked_by_user: null,
          group_name: 'Data Engineering',
          group_id: 123123,
          referenced_post: null,
        }
      },
      {
        id: 1113,
        user_id: 567,
        username: 'fedelobo',
        firstname: 'Fedelobo',
        lastname: '',
        profile_image_src: 'https://pbs.twimg.com/media/EQS_LmZUwAAaNFH.jpg',
        content: '',
        img_src: 'data:image/jpeg;base64,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',
        post_type: 'group',
        like_counter: 256,
        created_at: '2020/06/03',
        liked_by_user: null,
        group_name: null,
        group_id: null,
        referenced_post: null
      },
      {
        id: 1114,
        user_id: 876,
        username: 'freddier',
        firstname: 'Freddy',
        lastname: 'Vega',
        profile_image_src: 'https://pbs.twimg.com/profile_images/1062767896269590528/vOsDt9up.jpg',
        content: 'Nunca pares de aprender.',
        img_src: 'http://holatelcel.com/wp-content/uploads/2020/09/cheems-memes-8.jpg',
        post_type: 'shared',
        like_counter: 256,
        created_at: '2020/06/03',
        liked_by_user: null,
        group_name: 'Data Engineering',
        group_id: 12312,
        referenced_post: {
          user_id: 1212133,
          id: 1,
          username: 'cvandercito',
          firstname: 'Christian',
          lastname: 'Van Der Henst',
          profile_image_src: 'https://pbs.twimg.com/profile_images/1360718412180115456/gqe9GGqD_400x400.jpg',
          content: '7u7',
          img_src: 'https://freddyvega.com/content/images/2020/08/image-25.png',
          post_type: 'user',
          like_counter: 700,
          created_at: '2020/01/01',
          liked_by_user: null,
          group_name: 'Data Engineering',
          group_id: 123123,
          referenced_post: null,
        }
      }
    ];
  }

  setUserData(userData) {
    this.user = {
      icon: userData.profile_img_src,
      text: [
        {
          text: `${userData.firstname} ${userData.lastname}`,
          style: 'h2'
        },
        {
          text: userData.major,
          style: 'p'
        },
        {
          text: `@${userData.username}`,
          style: 'p'
        },
        {
          text: userData.type_user,
          style: 'p'
        },
        {
          text: userData.created_at,
          style: 'p'
        },
        {
          text: userData.description,
          style: 'p'
        }
      ],
      internalLink: null,
      externalLink: null
    }
  }

  favoriteEventHandler(event) {
    console.log(event)
  }

  commentEventHandler(event) {
    console.log(event)
    this.router.navigateByUrl(`/post/${event.publicationId}`)
  }

  updatePublicationForm(username) {
    let userData = this.session.get_userdata();
    if(userData) {
      if(userData.username == username) {
        this.displayPublicationForm = true;
        return;
      }
    }
    this.displayPublicationForm = false;
  }

  newPublicationHandler(event) {
    if(!event.text && !event.image) {
      this.notifications.info(
        'Publicación vacía',
        'Debes escribir algo o agregar una imagen para publicar');
      return;
    }

    let postData = {
      content: event.text,
      image: event.image
    };

    this.makePost(postData);
  }

  private makePost(postData) {
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.createUserPost(postData)
      .subscribe(res => {
        console.log(res)
        this.animations.globalProgressBarActive = false;
        if(res.code == 0) {
          this.notifications.success(
            'Publicación creada',
            'Tu publicación se ha creado');
          this.publications.unshift(res.data);
        } else if(res.code == 1) {
          this.notifications.info(
            'Publicación vacía',
            'Debes escribir algo o agregar una imagen para publicar');
        } else if(res.code == 2) {
          this.notifications.info(
            'No se puede compartir',
            'La publicación pertenece a un grupo privado');
        }
      });
  }

}
