import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  constructor(
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Welcome to the HUNT');
  }

  navigateToLogin(): void {
    this.router.navigate(['/user/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/user/register']);
  }

}
