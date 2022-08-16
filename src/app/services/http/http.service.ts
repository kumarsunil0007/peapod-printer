import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseURL: string = environment.baseURL;
  constructor(private http: HttpClient) {}

  get(resource: string, params: any): Observable<any> {
    return this.http.get(this.baseURL + resource, { params }).pipe(
      tap((_) => this.log('response received')),
      catchError(this.handleError('get', []))
    );
  }

  post(resource: string, data: any): Observable<any> {
    return this.http.post(this.baseURL + resource, data).pipe(
      tap((_) => this.log('response received')),
      catchError(this.handleError('post', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      let errorMsg: any;
      // if (error.error instanceof ErrorEvent) {
      if (error.error) {
        errorMsg = `Error: ${error.error.message}`;
      } else {
        errorMsg = `Error: ${error.message}`;
      }
      // TODO: send the error to remote logging infrastructure
      console.error(errorMsg); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${errorMsg}`);

      // Let the app keep running by returning an empty result.
      // return of(result as T);
      return throwError(error.error || errorMsg);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    console.log(message);
  }
}
