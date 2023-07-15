import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GlobalEventsService {

  private mainContainer: HTMLElement //Where all views are displayed.
  private currentUrl: string;
  private eventPool: EventPool = new EventPool();

  constructor(private router: Router) {
    this.mainContainer = document.getElementById('element-mat-drawer');
    
    //Set the current URL whenever it changes.
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
    
    //Event when the user reaches the bottom of the page.
    this.mainContainer.addEventListener('scroll', (e) => {
      let scrollLimit = this.mainContainer.scrollHeight - this.mainContainer.offsetHeight;
      let currentScrollPosition = this.mainContainer.scrollTop;

      if (currentScrollPosition >= scrollLimit) {
        let callbackList = this.eventPool.endOfPage;
        for (let cb of callbackList) {
          if (this.urlMatch(cb.urlWhereExecute, this.currentUrl)) {
            console.log('Excecuting:', cb.id, 'from "EndOfPage" event');
            cb.callback(e);
          }
        }
      }
    });
  }

  public onEndOfPage(id: string, url: string, callback: Function) {
    console.log('subscriber for End Of Page Event called');
    let callbackList = this.eventPool.endOfPage;
    for (let i = 0; i < callbackList.length; i++) {
      if (callbackList[i].id == id) {
        console.log('Callback found, replacing:', id);
        callbackList[i] = {
          id,
          urlWhereExecute: url,
          callback
        };
        return;
      }
    }
    console.log('Callback not found. Adding new:', id);
    callbackList.push({
      id,
      urlWhereExecute: url,
      callback
    });
  }

  private urlHasCommand(url: string) {
    return (url.indexOf(':') > 0);
  }

  private urlMatch(urlWhereExec: string, testUrl: string)  {
    if (this.urlHasCommand(urlWhereExec)) {
      let splitedExecUrl = urlWhereExec.split('/');
      let splitedTestUrl = testUrl.split('/');
      splitedExecUrl.shift();
      splitedTestUrl.shift();

      if (splitedExecUrl.length != splitedTestUrl.length) {
        return false;
      }

      for (let i = 0; i < splitedExecUrl.length; i++) {
        if (splitedExecUrl[i][0] == ':') {
          let command = splitedExecUrl[i].substr(1);
          let urlFragment;
          switch (command) {
            case 'number':
              urlFragment = parseFloat(splitedTestUrl[i]);
              if(isNaN(urlFragment)) {
                return false;
              }
            break;
            case 'string':
              urlFragment = parseFloat(splitedTestUrl[i]);
              if(!isNaN(urlFragment)) {
                return false;
              }
            break;
          }
        } else {
          if(splitedExecUrl[i] != splitedTestUrl[i]) {
            return false;
          }
        }
      }
      return true;
    } else {
      return urlWhereExec == testUrl;
    }
  }
}

export class EventPool {
  endOfPage: CallbackMetadata[] = [];
}

export class CallbackMetadata {
  id: string;
  urlWhereExecute: string;
  callback: Function
}