import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {QrCodeFilter} from "./qr-code.filter";

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  private url = 'https://scav-hunt-game.onrender.com/users/';

  constructor(private httpClient: HttpClient) { }


  getQrCodeById(id: number) {
    return this.httpClient.get(`${this.url}/${id}`);
  }

  createQrCode(qrCode: QrCodeFilter) {
    return this.httpClient.post(this.url, qrCode);
  }

}
