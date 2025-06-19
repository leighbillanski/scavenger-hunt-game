import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  loggedInUser: any;

  constructor(private router: Router, private userService: UserService) {
    this.loggedInUser = this.userService.getLoggedInUser();
  }

  navigateToUserInfo() {
    this.router.navigate(['/profile/info']);
  }

  saveProfile() {
    this.userService.setLoggedInUser(this.loggedInUser);
    alert('Profile updated locally!');
  }
}
