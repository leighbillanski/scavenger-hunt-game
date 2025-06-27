import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RiddleFilter} from "./riddle.filter";

@Injectable({
  providedIn: 'root'
})
export class RiddleService {

  private url = 'https://scav-hunt-game.onrender.com/riddle/';

  constructor(private httpClient: HttpClient) { }

  getAllRiddles(huntId: number | null) {
    return this.httpClient.get(this.url + `hunt/${huntId}`);
  }

  getRiddleById(id: number) {
    return this.httpClient.get(`${this.url}${id}`);
  }

  createRiddle(riddle: RiddleFilter) {
    return this.httpClient.post(this.url, riddle);
  }

  updateRiddle(id: number, riddle: RiddleFilter) {
    return this.httpClient.put(`${this.url}/${id}`, riddle);
  }

  deleteRiddle(id: number) {
    return this.httpClient.delete(`${this.url}/${id}`);
  }

  lastCompletedRiddle(riddle: RiddleFilter) {
    localStorage.setItem('riddle', JSON.stringify(riddle));
  }


  getLocalRiddle(): RiddleFilter | null {
    const riddle = localStorage.getItem('riddle');
    return riddle ? JSON.parse(riddle) : null;
  }

}
