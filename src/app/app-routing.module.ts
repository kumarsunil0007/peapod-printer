import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/page/home',
    pathMatch: 'full',
  },
  {
    path: 'page/home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'page/setting',
    loadChildren: () =>
      import('./pages/setting/setting.module').then((m) => m.SettingPageModule),
  },
  {
    path: 'page/login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
