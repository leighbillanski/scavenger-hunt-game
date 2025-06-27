import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RiddleService } from '../../services/riddle/riddle.service';
import { Title } from '@angular/platform-browser';

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
    // Check if the browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          const video = document.getElementById('qr-video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.play();
            this.scanQRCode(video);
          }
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          this.error = 'Failed to access camera. Please check permissions.';
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
    
    const scanFrame = () => {
      if (!this.isScanning) return;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          // Try to detect QR code using jsQR
          try {
            // In a real implementation, you would import and use jsQR here
            // import jsQR from 'jsqr';
            // const code = jsQR(imageData.data, imageData.width, imageData.height);
            // if (code) {
            //   this.onQRCodeDetected(code.data);
            //   return;
            // }
            
            // For now, use simulation for demo purposes
            this.simulateQRDetection();
          } catch (error) {
            console.error('QR code detection error:', error);
          }
        }
      }
      
      if (this.isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };
    
    scanFrame();
  }

  // Simulate QR code detection for demo purposes
  // In a real implementation, use a library like jsQR
  simulateQRDetection(): void {
    // This is a placeholder for actual QR code detection
    // You would integrate with a QR code scanning library here
    // For testing, we'll auto-detect after a few seconds
    if (this.isScanning && this.currentRiddle) {
      setTimeout(() => {
        if (this.isScanning) {
          // Auto-advance for demo (remove in production)
          // this.onQRCodeDetected(this.currentRiddle.qrCode?.qrData || 'demo');
        }
      }, 5000);
    }
  }

  // Method to handle scanned QR code data
  onQRCodeDetected(qrData: string): void {
    if (!this.currentRiddle) return;
    
    const expectedQRValue = this.currentRiddle.qrCode?.qrData || this.currentRiddle.qrCode;
    
    if (qrData === expectedQRValue) {
      this.closeScanner();
      this.nextRiddle();
    } else {
      this.error = 'QR code does not match the current riddle. Please try again.';
      setTimeout(() => this.error = '', 3000);
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