import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { StorageService } from './services/storage/storage.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/page/home', icon: 'home' },
    {
      title: 'Settings',
      url: '/page/setting',
      icon: 'cog',
      open: false,
      subPages: [
        {
          title: 'Printers',
          url: '/page/setting/printer',
          icon: 'print',
        },
      ],
    },
  ];
  constructor(
    private navCtrl: NavController,
    public storage: StorageService,
    private platform: Platform
  ) {
    this.init();
  }
  init() {
    this.platform.ready().then(async () => {
      const user = await this.storage.getItem('user');
      if (!user) {
        this.navCtrl.navigateRoot('/page/login');
      }
    });
  }
}
