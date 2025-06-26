import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from "../services/user/user.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  sidebarCollapsed = true;

  collageImages: string[] = [
    'assets/collage/20240721_143914.jpg',
    'assets/collage/20240907_080842.jpg',
    'assets/collage/20240914_201858.jpg',
    'assets/collage/20240929_102054.jpg',
    'assets/collage/20241201_200930.jpg',
    'assets/collage/20241214_122121.jpg',
    'assets/collage/20241214_122128.jpg',
    'assets/collage/20241226_194054.jpg',
    'assets/collage/20250101_173154.jpg',
    'assets/collage/20250112_153359.jpg',
    'assets/collage/20250129_174938.jpg',
    'assets/collage/20250302_163642.jpg',
    'assets/collage/20250322_144242.jpg',
    'assets/collage/20250405_095208.jpg',
    'assets/collage/20250405_095310.jpg',
    'assets/collage/20250405_110837.jpg',
    'assets/collage/20250405_183844.jpg',
    'assets/collage/20250531_135104.jpg',
    'assets/collage/20250606_182529.jpg',
    'assets/collage/Screenshot_20240826_194459_TikTok.jpg',
  ];
  lightboxImg: string | null = null;
  currentSlide: number = 0;

  constructor(private router: Router,
              private userService: UserService
              ) {}

  navigateToProfile() {
    this.router.navigate(['/profile/info']);
  }

  navigateToHunt() {
    this.router.navigate(['/hunt']);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.userService.logout();
      this.router.navigate(['/welcome']);
    }
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.userService.deleteUser(this.userService.getLoggedInUser().id).subscribe({
        next: () => {
          this.userService.logout();
          this.router.navigate(['/welcome']);
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          alert('Failed to delete account. Please try again.');
        }
      });
    }
  }

  openLightbox(img: string) {
    this.lightboxImg = img;
  }

  closeLightbox() {
    this.lightboxImg = null;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.collageImages.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.collageImages.length) % this.collageImages.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  hunts() {

  }

  riddles() {

  }
}

