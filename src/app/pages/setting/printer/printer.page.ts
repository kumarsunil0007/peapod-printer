import { Component, OnInit } from '@angular/core';
import { Printer, RasterObj } from '@awesome-cordova-plugins/star-prnt';
import { Printers } from '@awesome-cordova-plugins/star-prnt/ngx';
import { AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert/alert.service';
import { PrinterService } from 'src/app/services/printer/printer.service';
import { ReceiptService } from 'src/app/services/receipt/receipt.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-printer',
  templateUrl: './printer.page.html',
  styleUrls: ['./printer.page.scss'],
})
export class PrinterPage implements OnInit {
  portType: string;
  printerList: Printers = []; // [{portName: 'BT:00:11:62:17:E1:74', macAddress: '00:11:62:17:E1:74', modelName: 'BT:TSP100-B1220'}];
  selectedPrinter: any = {};
  defaultPrinter: any = null;
  constructor(
    private printerService: PrinterService,
    private alertService: AlertService,
    public alertCtrl: AlertController,
    private receiptService: ReceiptService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.portDiscovery('All');
  }

  ionViewDidEnter() {
    this.printerService.getDefaultPrinter().then((printer) => {
      console.log(printer);
      this.defaultPrinter = printer;
    });
  }

  async portDiscovery(portType: string) {
    const loading = await this.alertService.createLoading('Communicating');
    loading.present();
    this.printerService
      .portDiscovery(portType)
      .then((printers: Printers) => {
        loading.dismiss();
        this.printerList = [];
        this.printerList = printers;
        if (this.printerList.length) {
          this.selectedPrinter.printer = this.printerList[0];
        }
        console.log('Printers List ', this.printerList);
      })
      .catch((error) => {
        loading.dismiss();
        console.log('Printer Seach error : ' + JSON.stringify(error));
        // alert('Error finding printers ' + error);
      });
  }

  /**
   * Get the emulation type for a particular printer model.
   */
  async selected() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm. What is your printer?',
      inputs: [
        { type: 'radio', name: 'emulation', label: 'mPOP', value: 'StarPRNT' },
        { type: 'radio', name: 'emulation', label: 'FVP10', value: 'StarLine' },
        {
          type: 'radio',
          name: 'emulation',
          label: 'TSP100',
          value: 'StarGraphic',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'TSP650II',
          value: 'StarLine',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'TSP650II',
          value: 'StarLine',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'TSP700II',
          value: 'StarLine',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'TSP800II',
          value: 'StarLine',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SP700',
          value: 'StarDotImpact',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S210i',
          value: 'EscPosMobile',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S220i',
          value: 'EscPosMobile',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S230i',
          value: 'EscPosMobile',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-T300i/T300',
          value: 'EscPosMobile',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-T400i',
          value: 'EscPosMobile',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-L200',
          value: 'StarPRNT',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-L300',
          value: 'StarPRNT',
        },
        { type: 'radio', name: 'emulation', label: 'BSC10', value: 'EscPos' },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S210i StarPRNT',
          value: 'StarPRNT',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S220i StarPRNT',
          value: 'StarPRNT',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-S230i StarPRNT',
          value: 'StarPRNT',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-T300i/T300 StarPRNT',
          value: 'StarPRNT',
        },
        {
          type: 'radio',
          name: 'emulation',
          label: 'SM-T400i StarPRNT',
          value: 'StarPRNT',
        },
      ],
      buttons: [
        'Cancel',
        {
          text: 'OK',
          handler: async (emulation) => {
            console.log('emulation', emulation);
            await alert.dismiss();
            this.savePrinter(emulation);
          },
        },
      ],
    });
    await alert.present();
  }

  async savePrinter(emulation) {
    if (this.selectedPrinter.printer) {
      this.printerService.saveDefaultPrinter(
        this.selectedPrinter.printer,
        emulation
      );
      this.defaultPrinter = {
        modelName: this.selectedPrinter.printer.modelName,
        portName: this.selectedPrinter.printer.portName,
        macAddress: this.selectedPrinter.printer.macAddress,
        emulation,
      };
      this.storage.setItem('defaultPrinter', this.defaultPrinter);
      const alert = await this.alertCtrl.create({
        header: 'Printer Saved Successfully',
      });
      await alert.present();
    } else {
      this.alertService.createAlert('Unable to connect to printer');
    }
  }

  async printSample() {
    if (this.defaultPrinter) {
      this.selectPaperSize().then(async (paperSize) => {
        const rasterObj: RasterObj =
          this.receiptService.rasterReceiptExample(paperSize);

        const loading = await this.alertService.createLoading(
          'Communicating...'
        );
        loading.present();
        console.log('default Printer', this.defaultPrinter);
        this.printerService
          .printRasterReceipt(
            this.defaultPrinter.portName,
            this.defaultPrinter.emulation,
            rasterObj
          )
          .then((result) => {
            loading.dismiss();
            this.alertService.createAlert('Success!', 'Communication Result: ');
          })
          .catch((error) => {
            loading.dismiss();
            this.alertService.createAlert(error);
          });
      });
    } else {
      this.alertService.createAlert('Please select a printer!');
    }
  }

  async selectPaperSize(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertCtrl.create({
        header: 'Select Paper Size',
        inputs: [
          { type: 'radio', label: '2" (384dots)', value: '2', checked: true },
          { type: 'radio', label: '3" (576dots)', value: '3' },
          { type: 'radio', label: '4" (832dots)', value: '4' },
        ],
        buttons: [
          'Cancel',
          {
            text: 'OK',
            handler: (paperSize) => {
              alert.dismiss().then(() => {
                resolve(paperSize);
              });
              return false;
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
