import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RiddleService} from '../../services/riddle/riddle.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RiddleFilter} from "../../services/riddle/riddle.filter";
import {Title} from "@angular/platform-browser";
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-create-riddle',
  templateUrl: './create-riddle.component.html',
  styleUrls: ['./create-riddle.component.css']
})
export class CreateRiddleComponent implements OnInit{
  mode: 'create' | 'edit' | 'view' = 'create';
  riddleId: number | null = null;
  riddleForm: FormGroup;
  loading = false;
  huntId: string | null = null;
  currentRiddle: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private riddleService: RiddleService,
    private fb: FormBuilder,
    private title: Title,
  ) {
    this.riddleForm = this.fb.group({
      riddle: [''],
      sequence: ['']
    });
  }

  ngOnInit(): void {
    // Get huntId from query params
    this.route.queryParams.subscribe(params => {
      this.huntId = params['huntId'] || null;
    });

    this.route.url.subscribe(segments => {
      if (segments.some(s => s.path === 'edit')) {
        this.title.setTitle('Edit Riddle');
        this.mode = 'edit';
        this.riddleId = +this.route.snapshot.paramMap.get('id')!;
        this.loadRiddle();
      } else if (segments.some(s => s.path === 'view')) {
        this.title.setTitle('View Riddle');
        this.mode = 'view';
        this.riddleId = +this.route.snapshot.paramMap.get('id')!;
        this.loadRiddle();
      } else {
        this.mode = 'create';
        this.title.setTitle('Create Riddle');
      }
    });
  }

  loadRiddle(): void {
    if (!this.riddleId) {
      console.error('No riddle ID provided');
      this.router.navigate(['/riddle']);
      return;
    }
    this.loading = true;
    this.riddleService.getRiddleById(this.riddleId).subscribe({
      next: (riddle: any) => {
        console.log('Riddle loaded successfully:', riddle);
        this.currentRiddle = riddle; // Store current riddle data
        this.riddleForm.patchValue({
          riddle: riddle.riddleText,
          sequence: riddle.sequence
        });

        if (this.mode === 'view') {
          this.riddleForm.disable();
        } else {
          this.riddleForm.enable();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading riddle:', error);
        alert('Error loading riddle: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
        this.router.navigate(['/riddle']);
      }
    });
  }

  navigateBackToRiddles(): void {
    if (this.huntId) {
      this.router.navigate(['/riddle'], { queryParams: { huntId: this.huntId } });
    } else {
      this.router.navigate(['/riddle']);
    }
  }

  async generateQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        type: 'image/jpeg', // Set output type to JPEG
        rendererOpts: {
          quality: 0.92 // Optional: set JPEG quality (0-1)
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  /**
   * Converts a QR code string (data URL) to an HTMLImageElement.
   * @param qrCodeString The QR code as a data URL string (e.g., 'data:image/png;base64,...')
   * @returns Promise<HTMLImageElement>
   */
  convertQRCodeToImage(qrCodeString: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = qrCodeString;
    });
  }

  downloadQRCode(): void {
    if (this.currentRiddle && this.currentRiddle.qrCode) {
      this.convertQRCodeToImage(this.currentRiddle.qrCode.qrData)
        .then(img => {
          const riddleId = this.currentRiddle.id || '';
          // Create a canvas to draw the QR code and the riddle ID
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const padding = 30;
          const fontSize = 20;
          const textHeight = fontSize + 10;

          canvas.width = img.width;
          canvas.height = img.height + padding + textHeight;

          if (ctx) {
            // Fill the entire canvas with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw QR code on top of white background
            ctx.drawImage(img, 0, 0);

            // Draw riddle ID below QR code with better positioning
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.textBaseline = 'middle';

            const textY = img.height + (padding + textHeight) / 2;
            ctx.fillText(`Riddle ID: ${riddleId}`, canvas.width / 2, textY);
          }

          // Create a download link for the canvas image
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.download = `riddle-${riddleId || 'qrcode'}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(() => {
          alert('Failed to convert QR code to image.');
        });
    } else {
      alert('No QR code available for download.');
    }
  }

  viewQRCode(): void {
    if (this.currentRiddle && this.currentRiddle.qrCode) {
      this.convertQRCodeToImage(this.currentRiddle.qrCode.qrData)
        .then(img => {
          // Open the QR code image in a new tab
          const w = window.open('');
          if (w) {
            w.document.write(img.outerHTML);
          } else {
            alert('Unable to open new window/tab.');
          }
        })
        .catch(() => {
          alert('Failed to convert QR code to image.');
        });
    } else {
      alert('No QR code available to view.');
    }
  }

  async onSubmit(): Promise<void> {
    const riddleText = this.riddleForm.value.riddle;

    let riddle = new RiddleFilter();
    riddle.riddleText = riddleText;
    riddle.sequence = this.riddleForm.value.sequence;
    riddle.hunt = this.huntId || '';

    if (this.mode === 'create') {
      riddle.qrCode.qrData = await this.generateQRCode(riddleText);
      console.log('Riddle to be created:', riddle);
      this.riddleService.createRiddle(riddle).subscribe(() => {
        if (this.huntId) {
          this.router.navigate(['/riddle'], { queryParams: { huntId: this.huntId } });
        } else {
          this.router.navigate(['/riddle']);
        }
      });
    } else if (this.mode === 'edit' && this.riddleId) {
      this.riddleService.updateRiddle(this.riddleId, riddle).subscribe(() => {
        if (this.huntId) {
          this.router.navigate(['/riddle'], { queryParams: { huntId: this.huntId } });
        } else {
          this.router.navigate(['/riddle']);
        }
      });
    }
  }
}
