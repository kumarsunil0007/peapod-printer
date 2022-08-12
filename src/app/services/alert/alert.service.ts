import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async createAlert(error: string, message?: string) {
    const subTitle = message ? message : 'Something went wrong...';
    const customAlert = await this.alertCtrl.create({
      header: subTitle,
      subHeader: error,
      buttons: ['Ok'],
    });
    await customAlert.present();
  }

  async createLoading(loadingText: string) {
    return await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: loadingText,
      duration: 2000,
    });
  }
}
