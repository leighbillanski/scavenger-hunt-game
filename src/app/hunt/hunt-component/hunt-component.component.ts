import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import { HuntService } from '../../services/hunt/hunt.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hunt-component',
  templateUrl: './hunt-component.component.html',
  styleUrl: './hunt-component.component.css'
})
export class HuntComponentComponent implements OnInit {
  hunts: any[] = [];
  dropdownOpen: number | null = null;
  currentUser: any = null;
  userRole: string = '';

  constructor(
    private title: Title,
    private huntService: HuntService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Hunt');
    this.currentUser = this.userService.getLoggedInUser();
    this.userRole = this.currentUser?.role.toLocaleUpperCase() || '';
    console.log('Current User:', this.currentUser.role);

    this.huntService.getAllHunts().subscribe((data: any) => {
      this.hunts = data;
    });
  }

  navigateBackToHome(): void {
    this.router.navigate(['/home']);
  }

  onHuntClick(hunt: any): void {
    // Role-based navigation logic
    if (this.userRole === 'Hunter') {
      // Navigate to RiddleScannerComponent for hunters
      this.router.navigate(['/riddle/scanner', hunt.id]);
    } else if (this.userRole === 'Host') {
      // For hosts, do nothing on click (only dropdown should be available)
      return;
    } else {
      // Default behavior for other roles
      this.router.navigate(['/hunt', hunt.id]);
    }
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

  onPlayHunt(event: MouseEvent, hunt: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    if (hunt && hunt.id) {
      this.router.navigate(['/riddle/scanner', hunt.id]);
    }
  }

  isHunter(): boolean {
    return this.userRole === 'Hunter'.toLocaleUpperCase();
  }

  isHost(): boolean {
    return this.userRole === 'Host'.toLocaleUpperCase();
  }
}
