import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RegisterFilter} from "./register.filter";

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private url = 'http://localhost:3000/users/register';

  constructor(private http: HttpClient) { }

  register(user: RegisterFilter) {
    return this.http.post( this.url , user);
  }
}
