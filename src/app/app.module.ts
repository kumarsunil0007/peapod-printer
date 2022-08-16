import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { StarPRNT } from '@ionic-native/star-prnt/ngx';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpConfigInterceptor } from './httpConfig/httpConfig.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { File } from '@awesome-cordova-plugins/file/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot({
      name: 'peapod_printer',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    HttpClientModule,
  ],
  providers: [
    StarPRNT,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    File,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
