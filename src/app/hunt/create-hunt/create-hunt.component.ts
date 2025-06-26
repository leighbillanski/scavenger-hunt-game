import {Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HuntService } from '../../services/hunt/hunt.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import {HuntFilter} from "../../services/hunt/hunt.filter";
import {UserService} from "../../services/user/user.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-create-hunt',
  templateUrl: './create-hunt.component.html',
  styleUrls: ['./create-hunt.component.css']
})
export class CreateHuntComponent implements OnInit{
  mode: 'create' | 'edit' | 'view' = 'create';
  huntId: number | null = null;
  huntForm: FormGroup;
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private huntService: HuntService,
    private fb: FormBuilder,
    private title: Title,
    private userService: UserService
  ) {
    this.huntForm = this.fb.group({
      name: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      if (segments.some(s => s.path === 'edit')) {
        this.title.setTitle('Edit Hunt');
        this.mode = 'edit';
        this.huntId = +this.route.snapshot.paramMap.get('id')!;
        this.loadHunt();
      } else if (segments.some(s => s.path === 'view')) {
        this.title.setTitle('View Hunt');
        this.mode = 'view';
        this.huntId = +this.route.snapshot.paramMap.get('id')!;
        this.loadHunt();
      } else {
        this.mode = 'create';
        this.title.setTitle('Create Hunt');
      }
    });
  }

  loadHunt(): void {
    if (!this.huntId) {
      console.error('No hunt ID provided');
      this.router.navigate(['/hunt']);
      return;
    }
    this.loading = true;
    this.huntService.getHuntById(this.huntId).subscribe({
      next: (hunt: any) => {
        console.log('Hunt loaded successfully:', hunt);
        this.huntForm.patchValue({
          name: hunt.name,
          description: hunt.description
        });
        if (this.mode === 'view') {
          this.huntForm.disable();
        } else {
          this.huntForm.enable();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hunt:', error);
        alert('Error loading hunt: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
        this.router.navigate(['/hunt']);
      }
    });
  }

  navigateBackToHunts(): void {
    this.router.navigate(['/hunt']);
  }

  onSubmit(): void {
    let hunt = new HuntFilter();
    hunt.name = this.huntForm.value.name;
    hunt.description = this.huntForm.value.description;
    hunt.user = this.userService.getLoggedInUser().id;

    if (this.mode === 'create') {
      this.huntService.createHunt(hunt).subscribe(() => {
        this.router.navigate(['/hunt']);
      });
    } else if (this.mode === 'edit' && this.huntId) {
      this.huntService.updateHunt(this.huntId, hunt).subscribe(() => {
        this.router.navigate(['/hunt']);
      });
    }
  }
}
