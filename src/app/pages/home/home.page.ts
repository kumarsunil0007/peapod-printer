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
  orderNumber = '17539';
  order: any = {
    id: 17068,
    orderDate: '06/17/2022 10:17 AM',
    billing: {
      first_name: 'Jorge',
      last_name: 'Fernadie',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      email: 'info@peapodjewelry.com',
      phone: '989-908-1234',
    },
    shipping: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      phone: '',
    },
    summary: {
      discountTotal: '0',
      discountTax: '0',
      shippingTotal: '0',
      shippingTax: '0',
      total: '896.76',
      cartTax: '46.76',
      totalTax: '46.76',
    },
    payment: '',
    items: [
      {
        name: 'Easter Bunny Charm - Sterling Silver',
        quantity: 1,
        tax: '15.13',
        total: '275.00',
        meta: [
          {
            key: 'Metal',
            value: 'silver',
          },
        ],
      },
      {
        name: "Mother's Peapod® 1 Earrings - Sterling Silver",
        quantity: 1,
        tax: '9.35',
        total: '170.00',
        meta: [
          {
            key: 'Metal',
            value: 'silver',
          },
        ],
      },
      {
        name: 'Peapod Sea Turtle Necklace - Sterling Silver',
        quantity: 1,
        tax: '22.28',
        total: '405.00',
        meta: [
          {
            key: 'Metal',
            value: 'silver',
          },
        ],
      },
    ],
  };
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
  async printCustomerReceipt(consolidated?: boolean, print = false) {
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
      this.receiptImage = dataUrl;

      // const logoContent = await this.getBase64Image(logoURL)
      // if (logoContent) {
      //   const logoBlob = this.b64toBlob(logoContent, 'image/png')
      //   const logoUri: string = await this.saveFile(logoBlob, 'logo.png')
      //   if (logoUri) {
      //     // await this.printImageContent(logoUri, false)
      //   }
      //   console.log('Time 1', new Date().getSeconds())
      //   console.log('logoContent', logoUri)

      // }
      if (print) {
        const contentURI = await this.saveFile(contentBlob, 'receipt.png');
        console.log('Receipt Content:\n\n', receiptData);
        console.log('Receipt contentURI', contentURI);
        if (contentURI) {
          console.log('Time 2', new Date().getSeconds());
          await this.printImageContent(contentURI, true);
        }
      }

      // this.getBase64Image(logoURL).then((logoData) => {
      //   const logoBlob = this.b64toBlob(logoData, 'image/png')
      //   this.saveFile(logoBlob, 'logo.png').then(async (logoUri) => {
      //     console.log('Logo URi', logoUri)
      //     if (logoUri) {
      //       console.log('Time 1', new Date().getSeconds())
      //       await this.delay(3000)

      //       this.saveFile(blob, 'receipt.png').then(contentURI => {
      //         console.log('contentURI', contentURI)

      //         this.printImage(contentURI, true)
      //       })

      //     }
      //   })
      // })
      // printElement.innerHTML = ''
      this.printContent = '';
    });

    return;
    // console.log('Command\n\n', JSON.stringify(commands))
    if (this.defaultPrinter) {
      const loading = await this.alertService.createLoading('Communicating...');
      loading.present();
      // this.printerService.printRasterReceipt(this.defaultPrinter.portName, this.defaultPrinter.emulation, commands)
      //   .then(result => {
      //     loading.dismiss()
      //     this.alertService.createAlert('Success!', 'Communication Result: ')
      //   })
      //   .catch(error => {
      //     loading.dismiss()
      //     this.alertService.createAlert(error)
      //   })
    } else {
      this.alertService.createAlert('Please select a printer');
    }
  }

  getBase64Image(url) {
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

  b64toBlob(b64Data, contentType) {
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

  saveFile(content, name?: string): Promise<string> {
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
}
