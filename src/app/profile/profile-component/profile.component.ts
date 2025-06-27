import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  loggedInUser: any;

  constructor(private router: Router, private userService: UserService) {
    this.loggedInUser = this.userService.getLoggedInUser();
    this.loggedInUser.role = this.loggedInUser.role.toLocaleUpperCase()
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  saveProfile() {
    this.userService.setLoggedInUser(this.loggedInUser);
    this.userService.updateUser(this.loggedInUser.id, this.loggedInUser)
    alert('Profile updated!');
    this.router.navigate(['/home']);

  }
}
