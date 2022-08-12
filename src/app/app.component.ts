import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
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
  constructor(private navCtrl: NavController) {
    this.navCtrl.navigateRoot('/page/setting/printer');
  }
}
