import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  loaderToShow: any;
  user = { token: null };
  constructor(
    private storage: StorageService,
    public loadingCtrl: LoadingController
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.storage.getItem('user')).pipe(
      switchMap((user) => {
        //Authentication by setting header with token value
        if (user && user.token) {
          request = request.clone({
            setHeaders: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: `Bearer ${user.token}`,
            },
          });
        }

        request = request.clone({
          headers: request.headers.set('Accept', 'application/json'),
        });

        this.showLoader();
        return next.handle(request).pipe(
          map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              // console.log('event--->>>', event);
            }
            this.hideLoader();
            return event;
          }),
          catchError((error: HttpErrorResponse) => {
            console.error(error.message);
            this.hideLoader();
            if (error.status === 401) {
              console.log('redirect to login');
              // To Do: Redirect to Login
            }
            return throwError(error);
          })
        );
      })
    );
  }

  async showLoader() {
    this.loaderToShow = await this.loadingCtrl.create().then((res) => {
      res.present();
      //   res.onDidDismiss().then((dis) => {
      //     console.log('Loading dismissed!');
      //   });
    });
  }

  async hideLoader() {
    let topLoader = await this.loadingCtrl.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        // throw new Error('Could not dismiss the topmost loader. Aborting...');
        break;
      }
      topLoader = await this.loadingCtrl.getTop();
    }
  }
}
