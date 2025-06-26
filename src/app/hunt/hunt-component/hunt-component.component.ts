import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import { HuntService } from '../../services/hunt/hunt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hunt-component',
  templateUrl: './hunt-component.component.html',
  styleUrl: './hunt-component.component.css'
})
export class HuntComponentComponent implements OnInit {
  hunts: any[] = [];
  dropdownOpen: number | null = null;

  constructor(
    private title: Title,
    private huntService: HuntService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Hunt');
    this.huntService.getAllHunts().subscribe((data: any) => {
      this.hunts = data;
    });
  }

  navigateBackToHome(): void {
    this.router.navigate(['/home']);
  }

  onHuntClick(hunt: any): void {
    // Example: navigate to a hunt detail page (customize as needed)
    this.router.navigate(['/hunt', hunt.id]);
  }

  onAddHunt(): void {
    this.router.navigate(['/hunt/create']);
  }

  onViewHunt(hunt: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    this.huntService.setLocalHunt(hunt);
    this.router.navigate(['/hunt/view', hunt.id]);
  }


  onEditHunt(hunt: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    this.huntService.setLocalHunt(hunt);
    this.router.navigate(['/hunt/edit', hunt.id]);
  }

  toggleDropdown(index: number): void {
    this.dropdownOpen = this.dropdownOpen === index ? null : index;
  }

  closeDropdown(): void {
    this.dropdownOpen = null;
  }

  onViewRiddles(event: MouseEvent, hunt?: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    if (hunt && hunt.id) {
      this.router.navigate(['/riddle'], { queryParams: { huntId: hunt.id } });
    } else {
      this.router.navigate(['/riddle']);
    }
  }
}
