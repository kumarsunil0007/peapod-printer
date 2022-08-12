import { Injectable } from '@angular/core';
import { StarPRNT } from '@ionic-native/star-prnt/ngx';
import {
  Printer,
  Printers,
  PrinterStatus,
  PrintObj,
  RasterObj,
  ImageObj,
  CommandsArray,
} from '@awesome-cordova-plugins/star-prnt/ngx';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor(private starprnt: StarPRNT, private storage: StorageService) {}
  portDiscovery(type: string): Promise<Printers> {
    return this.starprnt.portDiscovery(type);
  }

  checkStatus(port: string, emulation: string): Promise<PrinterStatus> {
    return this.starprnt.checkStatus(port, emulation);
  }

  printRawText(
    port: string,
    emulation: string,
    printObj: PrintObj
  ): Promise<any> {
    return this.starprnt.printRawText(port, emulation, printObj);
  }

  printRasterReceipt(
    port: string,
    emulation: string,
    rasterObj: RasterObj
  ): Promise<any> {
    return this.starprnt.printRasterReceipt(port, emulation, rasterObj);
  }

  printImage(
    port: string,
    emulation: string,
    imageObj: ImageObj
  ): Promise<any> {
    return this.starprnt.printImage(port, emulation, imageObj);
  }

  print(
    port: string,
    emulation: string,
    commandsArray: CommandsArray
  ): Promise<any> {
    return this.starprnt.print(port, emulation, commandsArray);
  }

  openCashDrawer(port: string, emulation: string): Promise<any> {
    return this.starprnt.openCashDrawer(port, emulation);
  }

  connect(
    port: string,
    emulation: string,
    hasBarcodeReader: boolean
  ): Observable<any> {
    return this.starprnt.connect(port, emulation, hasBarcodeReader);
  }

  disconnect(): Promise<any> {
    return this.starprnt.disconnect();
  }

  getStatus(): Observable<any> {
    return this.starprnt.getStatus();
  }

  async saveDefaultPrinter(printer: Printer, emulation: string) {
    await this.storage.setItem('printer', {
      modelName: printer.modelName,
      portName: printer.portName,
      macAddress: printer.macAddress,
      emulation,
    });
  }

  getDefaultPrinter(): Promise<any> {
    return this.storage.getItem('printer');
  }
}
