import { Component, OnInit } from '@angular/core';
import { ImageObj } from '@awesome-cordova-plugins/star-prnt';
import html2canvas from 'html2canvas';
import apiRoutes from 'src/app/config/apiRoutes';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HttpService } from 'src/app/services/http/http.service';
import { PrinterService } from 'src/app/services/printer/printer.service';
import { ReceiptService } from 'src/app/services/receipt/receipt.service';
import { File, IWriteOptions } from '@awesome-cordova-plugins/file/ngx';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  errorMsg: any;
  orderNumber = '';
  selectedCopies = 1;
  order: any = null;
  orderHTML = '';
  defaultPrinter: any = null;
  printContent: string;
  receiptImage = null;
  constructor(
    private http: HttpService,
    private receiptService: ReceiptService,
    private printerService: PrinterService,
    private alertService: AlertService,
    private file: File,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.storage.getItem('defaultPrinter').then((resp) => {
      if (resp) {
        this.defaultPrinter = resp;
      }
    });
  }

  findOrder() {
    this.errorMsg = '';
    if (this.orderNumber.toString().length === 0) {
      this.errorMsg = 'Please enter order number';
      return;
    }
    this.http.get(`${apiRoutes.ORDER_SEARCH}${this.orderNumber}`, {}).subscribe(
      async (resp) => {
        if (resp.status) {
          this.order = resp.data;
          this.orderHTML = this.receiptService.htmlReceipt(resp.data, false);
        } else {
          this.order = null;
          this.orderHTML = '';
          this.errorMsg = resp.message;
        }
      },
      (error) => {
        this.errorMsg = error.message;
      }
    );
  }

  async printImageContent(uri: string, cutReceipt: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (this.defaultPrinter) {
        const cut = cutReceipt ? true : false;
        const imageObj: ImageObj = {
          uri,
          paperWidth: 576,
          cutReceipt: cut,
          openCashDrawer: false,
        };

        this.printerService
          .printImage(
            this.defaultPrinter.portName,
            this.defaultPrinter.emulation,
            imageObj
          )
          .then((result) => {
            resolve(true);
          })
          .catch((error) => {
            this.showToast(error);
            resolve(false);
          });
      } else {
        this.showToast('Please select printer');
        resolve(false);
      }
    });
  }

  async showToast(message) {
    const loading = await this.alertService.createLoading(message);
    loading.present();
    setTimeout(() => {
      loading.dismiss();
    }, 5000);
  }

  /************** Test functions */
  async printCustomerReceipt(consolidated?: boolean) {
    if (!this.defaultPrinter) {
      await this.alertService.createAlert(
        'Please Connect a Printer',
        'Error: No Printer'
      );
      return;
    }
    const commands = this.receiptService.htmlReceipt(this.order, consolidated);
    const printElement = document.getElementById('printPOS');
    printElement.innerHTML = commands;

    html2canvas(printElement, {
      scale: 2,
      width: 375,
      allowTaint: true,
      logging: true,
      useCORS: true,
      height: document.getElementById('printPOS').offsetHeight + 100,
      windowHeight: document.getElementById('printPOS').offsetHeight + 100,
      // scrollY: -window.scrollY,
      onclone: (_clonedDoc: any) => {
        console.log('Printe Element');
        //     printElement.style.display = 'block';
        //     const el = printElement;
        //     el.style.opacity = '100';
        //     el.style.zIndex = '99';
      },
    }).then(async (canvas) => {
      const dataUrl = canvas.toDataURL();
      const ctx = canvas.getContext('2d');
      console.log(
        'canvas',
        canvas,
        'height :',
        canvas.height + 50,
        ctx.canvas.height
      );

      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const imgWidth = (canvas.width * 25.4) / 190;
      const imgHeight = (canvas.height * 25.4) / 190;
      ctx.clearRect(0, 0, imgWidth, imgHeight);

      const receiptData = dataUrl.split(',')[1];
      const contentBlob = this.b64toBlob(receiptData, 'image/png');

      const contentURI = await this.saveFile(contentBlob, 'receipt.png');
      if (contentURI) {
        const loading = await this.alertService.createLoading(
          'Communicating...'
        );
        loading.present();
        console.log('Time 2', new Date().getSeconds());
        await this.printImageContent(contentURI, true);
        loading.dismiss();
      }
      printElement.innerHTML = '';
      this.printContent = '';
    });
    return;
  }

  getBase64Image(url: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        let canvasEle = document.createElement('CANVAS') as HTMLCanvasElement;
        const ctx = canvasEle.getContext('2d');
        canvasEle.height = 100; // img.height
        canvasEle.width = 576; // img.width
        const xAxis = canvasEle.height / 2 - img.height / 2;
        const yAxis = canvasEle.width / 2 - img.width / 2;
        ctx.drawImage(img, yAxis, xAxis);
        const dataURL = canvasEle.toDataURL('image/png').split(',')[1];
        // callback(dataURL);

        canvasEle = null;
        resolve(dataURL);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = url;
    });
  }

  b64toBlob(b64Data: string, contentType: string) {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  saveFile(content: Blob, name?: string): Promise<string> {
    const fileName = name ? name : new Date().getTime() + '.png';
    const path = this.file.dataDirectory;
    const options: IWriteOptions = { replace: true };
    return new Promise((resolve) => {
      this.file
        .writeFile(path, fileName, content, options)
        .then((resp) => {
          resolve(resp.nativeURL);
        })
        .catch((err) => {
          console.log('File Save Error', JSON.stringify(err));
          resolve(null);
        });
    });
  }
  increment() {
    if (this.selectedCopies <= 3) {
      this.selectedCopies++;
    }
  }

  decrement() {
    if (this.selectedCopies > 1) {
      this.selectedCopies--;
    }
  }
}
