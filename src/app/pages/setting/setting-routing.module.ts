import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  //   {
  //     path: '',
  //     loadChildren: () =>
  //       import('./printer/printer.module').then((m) => m.PrinterPageModule),
  //   },
  {
    path: 'printer',
    loadChildren: () =>
      import('./printer/printer.module').then((m) => m.PrinterPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingPageRoutingModule {}
