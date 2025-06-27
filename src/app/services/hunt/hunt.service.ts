import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HuntFilter} from "./hunt.filter";

@Injectable({
  providedIn: 'root'
})
export class HuntService {

  private url = 'https://scav-hunt-game.onrender.com/hunt/';

  constructor(private httpClient: HttpClient) { }

  getAllHunts() {
    return this.httpClient.get(this.url);
  }

  getHuntById(id: number) {
    return this.httpClient.get(`${this.url}${id}`);
  }

  createHunt(hunt: HuntFilter) {
    return this.httpClient.post(this.url, hunt);
  }

  updateHunt(id: number, hunt: HuntFilter) {
    return this.httpClient.put(`${this.url}${id}`, hunt);
  }

  deleteHunt(id: number) {
    return this.httpClient.delete(`${this.url}${id}`);
  }

  setLocalHunt(hunt: any) {
    localStorage.setItem('hunt', JSON.stringify(hunt));
  }

  getLocalHunt() {
    const hunt = localStorage.getItem('hunt');
    return hunt ? JSON.parse(hunt) : null;
  }

}

