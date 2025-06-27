import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RiddleService } from '../../services/riddle/riddle.service';
import { Title } from '@angular/platform-browser';
import jsQR from 'jsqr';

@Component({
  selector: 'app-riddle-scanner',
  templateUrl: './riddle-scanner.component.html',
  styleUrls: ['./riddle-scanner.component.css']
})
export class RiddleScannerComponent implements OnInit, OnDestroy {
  huntId: number = 0;
  riddles: any[] = [];
  currentRiddleIndex: number = 0;
  currentRiddle: any = null;
  isScanning: boolean = false;
  scannerVisible: boolean = false;
  completed: boolean = false;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private riddleService: RiddleService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Riddle Scanner');
    this.route.params.subscribe(params => {
      this.huntId = +params['huntId'];
      if (this.huntId) {
        this.loadRiddles();
      } else {
        this.error = 'No hunt ID provided';
        this.loading = false;
      }
    });
  }

  loadRiddles(): void {
    this.loading = true;
    this.riddleService.getAllRiddles(this.huntId).subscribe({
      next: (data: any) => {
        this.riddles = data.sort((a: any, b: any) => a.sequence - b.sequence);
        if (this.riddles.length > 0) {
          this.currentRiddle = this.riddles[0];
        } else {
          this.error = 'No riddles found for this hunt';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load riddles';
        this.loading = false;
        console.error('Error loading riddles:', err);
      }
    });
  }

  openScanner(): void {
    this.scannerVisible = true;
    this.isScanning = true;
    this.startQRScanner();
  }

  closeScanner(): void {
    this.scannerVisible = false;
    this.isScanning = false;
    this.stopQRScanner();
  }

  startQRScanner(): void {
    console.log('Starting QR Scanner...');
    this.enhanceQRDetection();
    
    // Check if the browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          const video = document.getElementById('qr-video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.setAttribute('playsinline', 'true'); // For iOS
            video.play().then(() => {
              console.log('Video is playing, starting QR detection...');
              this.scanQRCode(video);
            }).catch(err => {
              console.error('Error playing video:', err);
              this.error = 'Failed to start video stream.';
              this.closeScanner();
            });
          }
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          this.error = 'Failed to access camera. Please check permissions and try again.';
          this.closeScanner();
        });
    } else {
      this.error = 'Camera not supported in this browser';
      this.closeScanner();
    }
  }

  stopQRScanner(): void {
    const video = document.getElementById('qr-video') as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  }

  scanQRCode(video: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Could not get canvas context');
      this.error = 'Canvas not supported';
      this.closeScanner();
      return;
    }
    
    const scanFrame = () => {
      if (!this.isScanning) return;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width === 0 || canvas.height === 0) {
          console.warn('Video dimensions not ready');
          requestAnimationFrame(scanFrame);
          return;
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          // Use jsQR to detect QR codes with multiple inversion attempts
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
          
          if (qrCode && qrCode.data) {
            console.log('QR Code detected:', qrCode.data);
            console.log('QR Code location:', qrCode.location);
            this.onQRCodeDetected(qrCode.data);
            return; // Stop scanning once we find a code
          }
        } catch (error) {
          console.error('QR code detection error:', error);
        }
      }
      
      if (this.isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };
    
    scanFrame();
  }

  // Enhanced QR code detection with better error handling
  enhanceQRDetection(): void {
    console.log('QR Scanner is active, looking for QR codes...');
    console.log('Expected QR code value:', this.currentRiddle?.qrCode?.qrData);
  }

  // Method to handle scanned QR code data
  onQRCodeDetected(qrData: string): void {
    console.log('Processing QR code:', qrData);
    
    if (!this.currentRiddle) {
      console.error('No current riddle available');
      return;
    }
    
    const expectedQRValue = this.currentRiddle.qrCode?.qrData || this.currentRiddle.qrCode;
    console.log('Expected QR value:', expectedQRValue);
    console.log('Scanned QR value:', qrData);
    
    // Trim whitespace and compare
    const trimmedScanned = qrData.trim();
    const trimmedExpected = expectedQRValue ? expectedQRValue.toString().trim() : '';
    
    if (trimmedScanned === trimmedExpected) {
      console.log('QR code matches! Moving to next riddle...');
      this.closeScanner();
      this.nextRiddle();
    } else {
      console.log('QR code does not match');
      this.error = `QR code does not match. Expected: ${trimmedExpected}, Got: ${trimmedScanned}`;
      setTimeout(() => this.error = '', 5000);
    }
  }

  // Method for manual QR code entry (for testing)
  onManualQREntry(): void {
    const qrInput = prompt('Enter QR code data for testing:');
    if (qrInput) {
      this.onQRCodeDetected(qrInput);
    }
  }

  nextRiddle(): void {
    this.currentRiddleIndex++;
    if (this.currentRiddleIndex < this.riddles.length) {
      this.currentRiddle = this.riddles[this.currentRiddleIndex];
      this.error = '';
    } else {
      this.completed = true;
      this.currentRiddle = null;
    }
  }

  navigateBack(): void {
    this.router.navigate(['/hunt']);
  }

  restartHunt(): void {
    this.currentRiddleIndex = 0;
    this.currentRiddle = this.riddles[0];
    this.completed = false;
    this.error = '';
  }

  ngOnDestroy(): void {
    this.stopQRScanner();
  }
} 