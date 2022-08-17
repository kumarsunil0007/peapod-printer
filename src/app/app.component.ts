import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication/authentication.service';
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
    private router: Router,
    public authService: AuthenticationService
  ) {}

  async logout() {
    document.getElementById('printPOS').innerHTML = '';
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
