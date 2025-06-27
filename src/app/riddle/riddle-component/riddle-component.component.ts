import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import { RiddleService } from '../../services/riddle/riddle.service';
import { Router, ActivatedRoute } from '@angular/router';
import {HuntService} from "../../services/hunt/hunt.service";

@Component({
  selector: 'app-riddle-component',
  templateUrl: './riddle-component.component.html',
  styleUrl: './riddle-component.component.css'
})
export class RiddleComponentComponent implements OnInit {
  riddles: any[] = [];
  dropdownOpen: number | null = null;
  huntId: number | null = null;

  constructor(
    private title: Title,
    private riddleService: RiddleService,
    private router: Router,
    private huntService: HuntService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Riddles');
    this.route.queryParams.subscribe(params => {
      this.huntId = this.huntId = params['huntId'] ? Number(params['huntId']) : null;
    });
    console.log(this.huntService.getLocalHunt().id);
    if (!this.huntId) {
      this.huntId = this.huntService.getLocalHunt().id;
    }

    this.riddleService.getAllRiddles(this.huntId).subscribe((data: any) => {
      this.riddles = data;
      console.log('Riddles loaded:', this.riddles);
      // Filter riddles by hunt if huntId is provided
      if (this.huntId) {
        this.riddles = this.riddles.filter(riddle => riddle.hunt.id == this.huntId);
      }
    });
  }

  navigateBackToHome(): void {
    this.router.navigate(['/hunt']);
  }

  onRiddleClick(riddle: any): void {
    this.router.navigate(['/riddle', riddle.id]);
  }

  onAddRiddle(): void {
    if (this.huntId) {
      this.router.navigate(['/riddle/create'], { queryParams: { huntId: this.huntId } });
    } else {
      this.router.navigate(['/riddle/create']);
    }
  }

  onViewRiddle(riddle: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    this.router.navigate(['/riddle/view', riddle.id]);
  }

  onEditRiddle(riddle: any, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeDropdown();
    this.router.navigate(['/riddle/edit', riddle.id]);
  }

  toggleDropdown(index: number): void {
    this.dropdownOpen = this.dropdownOpen === index ? null : index;
  }

  closeDropdown(): void {
    this.dropdownOpen = null;
  }
}
