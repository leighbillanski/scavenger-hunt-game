import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserFilter} from "./user.filter";

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private url = 'https://scav-hunt-game.onrender.com/users/';

  constructor(private http: HttpClient) { }

  register(user: UserFilter) {
    return this.http.post( this.url + 'register' , user);
  }

  login(filter: UserFilter){
    const userName = filter.userName;
    const password = filter.password;
    return this.http.post(this.url + 'login' , { userName, password });
  }

  setLoggedInUser(user: any) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  getLoggedInUser() {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
  }

  deleteUser(userId: string) {
    return this.http.delete(this.url + userId);
  }

  updateUser(userId: string, user: UserFilter) {
    return this.http.put(this.url + userId, user);
  }

  getUserById(userId: string) {
    return this.http.get(this.url + userId);
  }

  getAllUsers() {
    return this.http.get(this.url);
  }

  logout() {
    localStorage.removeItem('loggedInUser');
  }
}
