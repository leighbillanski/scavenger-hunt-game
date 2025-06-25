import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-hunt-component',
  templateUrl: './hunt-component.component.html',
  styleUrl: './hunt-component.component.css'
})
export class HuntComponentComponent implements OnInit {

  constructor(
    private title: Title
  ) {
  }

  ngOnInit(): void {
    this.title.setTitle('Hunt');
  }

  navigateBackToHome(): void {
    window.history.back();
  }

}
