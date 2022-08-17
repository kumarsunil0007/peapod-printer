import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import apiRoutes from 'src/app/config/apiRoutes';
import { HttpService } from '../http/http.service';
import { StorageService } from '../storage/storage.service';

const TOKEN_KEY = 'user';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    null
  );
  token = '';

  constructor(private storage: StorageService, private http: HttpService) {
    this.loadToken();
  }

  async loadToken() {
    const user = await this.storage.getItem(TOKEN_KEY);
    if (user && user.token) {
      this.token = user.token;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login(data): Observable<any> {
    return this.http.post(apiRoutes.LOGIN, data).pipe(
      map((resp: any) => (resp.token ? resp : null)),
      switchMap((token) => from(this.storage.setItem(TOKEN_KEY, token))),
      tap((_) => {
        this.isAuthenticated.next(true);
      })
    );
  }

  logout(): Promise<void> {
    this.isAuthenticated.next(false);
    return this.storage.removeItem(TOKEN_KEY);
  }
}
