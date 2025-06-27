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
  progressRestored: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private riddleService: RiddleService,
    private title: Title
  ) {}

    ngOnInit(): void {
    this.title.setTitle('Riddle Scanner');
    console.log('RiddleScannerComponent initialized');
    
    // Test if jsQR is available
    console.log('jsQR available:', typeof jsQR);
    
    this.route.params.subscribe(params => {
      this.huntId = +params['huntId'];
      console.log('Hunt ID from route:', this.huntId);
      if (this.huntId) {
        // Load cached progress if available
        this.loadCachedProgress();
        this.loadRiddles();
      } else {
        this.error = 'No hunt ID provided';
        this.loading = false;
      }
    });
  }

    loadCachedProgress(): void {
    const cacheKey = `riddle_progress_${this.huntId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const progress = JSON.parse(cachedData);
        if (progress.huntId === this.huntId && progress.currentRiddleIndex >= 0) {
          this.currentRiddleIndex = progress.currentRiddleIndex;
          console.log('📦 Loaded cached progress:', progress);
          console.log(`🔄 Resuming from riddle index: ${this.currentRiddleIndex}`);
          this.progressRestored = true;
        }
      } catch (error) {
        console.error('Error parsing cached progress:', error);
        this.clearCachedProgress();
      }
    }
  }

  saveCachedProgress(): void {
    const cacheKey = `riddle_progress_${this.huntId}`;
    const progress = {
      huntId: this.huntId,
      currentRiddleIndex: this.currentRiddleIndex,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(progress));
    console.log('💾 Saved progress to cache:', progress);
  }

  clearCachedProgress(): void {
    const cacheKey = `riddle_progress_${this.huntId}`;
    localStorage.removeItem(cacheKey);
    console.log('🗑️ Cleared cached progress for hunt:', this.huntId);
  }

  loadRiddles(): void {
    this.loading = true;
    this.riddleService.getAllRiddles(this.huntId).subscribe({
      next: (data: any) => {
        console.log('📋 Raw riddles data (hunt list):', data);
        this.riddles = data.sort((a: any, b: any) => a.sequence - b.sequence);
        console.log('📋 Sorted riddles:', this.riddles);
        
        if (this.riddles.length > 0) {
          // Validate cached progress against actual riddles
          if (this.currentRiddleIndex >= this.riddles.length) {
            console.warn('⚠️ Cached progress is beyond available riddles, resetting...');
            this.currentRiddleIndex = 0;
            this.clearCachedProgress();
          }
          
          // Load the current riddle with complete data (including qrCode)
          this.loadCurrentRiddleComplete();
        } else {
          this.error = 'No riddles found for this hunt';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load riddles';
        this.loading = false;
        console.error('Error loading riddles:', err);
      }
    });
  }

  loadCurrentRiddleComplete(): void {
    if (this.currentRiddleIndex < this.riddles.length) {
      const riddleId = this.riddles[this.currentRiddleIndex].id;
      console.log(`🔄 Loading complete riddle data for riddle ID: ${riddleId}`);

      this.riddleService.getRiddleById(riddleId).subscribe({
        next: (completeRiddle: any) => {
          console.log('🎯 Complete riddle data with qrCode:', completeRiddle);
          this.currentRiddle = completeRiddle;
          console.log('🔍 All riddle properties:', Object.keys(this.currentRiddle));

          // Check all properties that might contain QR data
          console.log('🔍 Checking all possible QR properties:');
          console.log('  qrCode:', this.currentRiddle.qrCode);
          console.log('  qrCodeValue:', this.currentRiddle.qrCodeValue);
          console.log('  qrData:', this.currentRiddle.qrData);
          console.log('  qr:', this.currentRiddle.qr);
          console.log('  code:', this.currentRiddle.code);
          console.log('  qrCodeData:', this.currentRiddle.qrCodeData);

          // If qrCode exists, show its properties
          if (this.currentRiddle.qrCode) {
            console.log('🏷️ QR Code object properties:', Object.keys(this.currentRiddle.qrCode));
            console.log('🏷️ QR Code full object:', this.currentRiddle.qrCode);
          } else {
            console.warn('⚠️ No qrCode property found in complete riddle data!');
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading complete riddle:', err);
          this.error = 'Failed to load riddle details';
          this.loading = false;
        }
      });
    }
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
    console.log('🎥 Starting QR Scanner...');
    console.log('Navigator:', !!navigator);
    console.log('MediaDevices:', !!navigator.mediaDevices);
    console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);

    this.enhanceQRDetection();
    this.testQRDetection(); // Test jsQR on startup

    // Check if the browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('🎯 Requesting camera with constraints:', constraints);

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          console.log('✅ Camera stream obtained:', stream);
          console.log('Stream tracks:', stream.getTracks().map(track => ({
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            readyState: track.readyState
          })));

          const video = document.getElementById('qr-video') as HTMLVideoElement;
          if (video) {
            console.log('📺 Video element found, setting up stream...');
            video.srcObject = stream;
            video.setAttribute('playsinline', 'true'); // For iOS

            // Add event listeners for debugging
            video.addEventListener('loadedmetadata', () => {
              console.log(`📐 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
            });

            video.addEventListener('canplay', () => {
              console.log('▶️ Video can start playing');
            });

            video.play().then(() => {
              console.log('🎬 Video is playing, starting QR detection...');
              console.log(`Final video dimensions: ${video.videoWidth}x${video.videoHeight}`);
              this.scanQRCode(video);
            }).catch(err => {
              console.error('❌ Error playing video:', err);
              this.error = 'Failed to start video stream.';
              this.closeScanner();
            });
          } else {
            console.error('❌ Video element not found!');
            this.error = 'Video element not found';
            this.closeScanner();
          }
        })
        .catch(err => {
          console.error('❌ Error accessing camera:', err);
          console.error('Error details:', {
            name: err.name,
            message: err.message,
            constraint: err.constraint
          });

          let errorMessage = 'Failed to access camera. ';
          if (err.name === 'NotAllowedError') {
            errorMessage += 'Please allow camera permissions and try again.';
          } else if (err.name === 'NotFoundError') {
            errorMessage += 'No camera found on this device.';
          } else if (err.name === 'NotReadableError') {
            errorMessage += 'Camera is being used by another application.';
          } else {
            errorMessage += `Error: ${err.message}`;
          }

          this.error = errorMessage;
          this.closeScanner();
        });
    } else {
      console.error('❌ Camera not supported in this browser');
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
    let frameCount = 0;

    if (!context) {
      console.error('Could not get canvas context');
      this.error = 'Canvas not supported';
      this.closeScanner();
      return;
    }

    console.log('Starting QR code scanning loop...');

    const scanFrame = () => {
      if (!this.isScanning) {
        console.log('Scanning stopped');
        return;
      }

      frameCount++;

      // Log every 60 frames (roughly every 1 second at 60fps)
      if (frameCount % 60 === 0) {
        console.log(`Scanning frame ${frameCount}, video ready state: ${video.readyState}`);
        console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
          console.warn('Video dimensions not ready, retrying...');
          requestAnimationFrame(scanFrame);
          return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Log image data info every 120 frames
        if (frameCount % 120 === 0) {
          console.log(`Image data: ${imageData.width}x${imageData.height}, data length: ${imageData.data.length}`);
        }

                  try {
            // Use jsQR to detect QR codes with multiple inversion attempts
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth"
            });

            if (qrCode && qrCode.data) {
              console.log('🎉 QR Code detected!');
              console.log('QR Code data:', qrCode.data);
              console.log('QR Code location:', qrCode.location);
              console.log('QR Code corners:', qrCode.location);

              // Visual feedback - flash the scanner frame
              const scannerFrame = document.querySelector('.scanner-frame') as HTMLElement;
              if (scannerFrame) {
                scannerFrame.style.borderColor = '#00ff00';
                setTimeout(() => {
                  scannerFrame.style.borderColor = '#28a745';
                }, 200);
              }

              this.onQRCodeDetected(qrCode.data);
              return; // Stop scanning once we find a code
            }
          } catch (error) {
            console.error('QR code detection error:', error);
            if (frameCount < 10) { // Only log first few errors to avoid spam
              console.error('jsQR error details:', error);
            }
          }
      } else {
        // Log video state issues
        if (frameCount % 60 === 0) {
          console.log(`Video not ready: readyState=${video.readyState}, networkState=${video.networkState}`);
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
    console.log('🎯 QR Scanner is active, looking for QR codes...');

    if (this.currentRiddle) {
      console.log('🔍 Current riddle:', this.currentRiddle);

      const expectedValue = this.findQRCodeValue(this.currentRiddle);
      if (expectedValue) {
        console.log('✅ QR code data found! Ready to scan.');
        console.log('🎯 Expected QR value:', expectedValue);
      } else {
        console.warn('⚠️ No QR code data found in any expected location!');
        console.log('🔍 Check the full riddle structure above to see available properties.');
      }
    }
  }

  // Method to handle scanned QR code data
  onQRCodeDetected(qrData: string): void {
    console.log('🔍 Processing QR code:', qrData);

    if (!this.currentRiddle) {
      console.error('❌ No current riddle available');
      return;
    }

    // Try to find QR code data in various possible locations
    const expectedQRValue = this.findQRCodeValue(this.currentRiddle);

    console.log('🎯 Expected QR value found:', expectedQRValue);
    console.log('📱 Scanned QR value:', qrData);

    if (!expectedQRValue) {
      console.error('❌ No QR code data found in any expected location');
      console.log('🔍 Full riddle object for debugging:', this.currentRiddle);
      this.error = 'No QR code configured for this riddle. Check console for riddle structure.';
      setTimeout(() => this.error = '', 8000);
      return;
    }

    // Trim whitespace and compare
    const trimmedScanned = qrData.trim();
    const trimmedExpected = expectedQRValue.toString().trim();

    console.log(`🔍 Comparing: "${trimmedScanned}" === "${trimmedExpected}"`);

    if (trimmedScanned === trimmedExpected) {
      alert('✅ QR code matches! Moving to next riddle...');
      this.closeScanner();
      this.nextRiddle();
    } else {
      alert('❌ QR code does not match');
      this.error = `QR code does not match!\n\nExpected: "${trimmedExpected}"\nScanned: "${trimmedScanned}"\n\nTry scanning again or use Manual Entry to test.`;

      // Show error for longer to give user time to read
      setTimeout(() => this.error = '', 8000);

      // Don't close scanner, let them try again
      console.log('🔄 Scanner staying open for retry...');
      this.startQRScanner();
    }
  }

  // Helper method to find QR code value in various possible locations
  findQRCodeValue(riddle: any): string | null {
    console.log('🔍 Searching for QR code value in riddle...');

    // Try all possible QR code property paths, starting with riddleText
    const possiblePaths = [
      { path: 'riddleText', value: riddle.riddleText },
      { path: 'qrCode.qrData', value: riddle.qrCode?.qrData },
      { path: 'qrCode.qrCodeValue', value: riddle.qrCode?.qrCodeValue },
      { path: 'qrCode.data', value: riddle.qrCode?.data },
      { path: 'qrCode.value', value: riddle.qrCode?.value },
      { path: 'qrCode.code', value: riddle.qrCode?.code },
      { path: 'qrCode (direct string)', value: typeof riddle.qrCode === 'string' ? riddle.qrCode : null },
      { path: 'qrCodeValue', value: riddle.qrCodeValue },
      { path: 'qrData', value: riddle.qrData },
      { path: 'qrCodeData', value: riddle.qrCodeData },
      { path: 'qr.data', value: riddle.qr?.data },
      { path: 'qr.value', value: riddle.qr?.value },
      { path: 'code', value: riddle.code },
    ];

    for (const item of possiblePaths) {
      console.log(`  Checking ${item.path}:`, item.value);
      // Skip base64 image data - we want text values
      if (item.value !== undefined && item.value !== null && item.value !== '' &&
          typeof item.value === 'string' && !item.value.startsWith('data:image/')) {
        console.log(`✅ Found QR code value at: ${item.path} = "${item.value}"`);
        return item.value;
      }
    }

    console.warn('⚠️ No QR code value found in any expected location');
    return null;
  }

  // Method for manual QR code entry (for testing)
  onManualQREntry(): void {
    console.log('📝 Manual QR entry triggered');
    console.log('Current riddle:', this.currentRiddle);

    if (this.currentRiddle) {
      const expectedValue = this.findQRCodeValue(this.currentRiddle);
      console.log('Expected QR value found:', expectedValue);

      if (!expectedValue) {
        alert('No QR code data found for this riddle. Check console for riddle structure.');
        return;
      }

      const qrInput = prompt(`Manual QR Code Entry\n\nExpected value: "${expectedValue}"\n\nEnter the QR code data to test:`);
      if (qrInput !== null) { // Check for null to handle cancel
        console.log('📝 Manual input received:', qrInput);
        this.onQRCodeDetected(qrInput);
      }
    } else {
      alert('No current riddle available for testing');
    }
  }

  // Test function to verify jsQR is working
  testQRDetection(): void {
    console.log('Testing QR detection capabilities...');
    try {
      // Create a simple test image data (small black and white pattern)
      const testWidth = 100;
      const testHeight = 100;
      const testData = new Uint8ClampedArray(testWidth * testHeight * 4);

      // Fill with white pixels
      for (let i = 0; i < testData.length; i += 4) {
        testData[i] = 255;     // R
        testData[i + 1] = 255; // G
        testData[i + 2] = 255; // B
        testData[i + 3] = 255; // A
      }

      const result = jsQR(testData, testWidth, testHeight);
      console.log('jsQR test result (should be null for white image):', result);
      console.log('jsQR is working correctly');
    } catch (error) {
      console.error('jsQR test failed:', error);
    }
  }

  // Show a test QR code for scanning
  showTestQR(): void {
    if (this.currentRiddle) {
      const expectedValue = this.findQRCodeValue(this.currentRiddle);

      if (expectedValue) {
        // Generate QR code with the actual expected value
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(expectedValue)}`;

        const message = `QR Code for Current Riddle\n\nExpected value: "${expectedValue}"\n\nThis QR code should match the current riddle!\n\nURL: ${qrUrl}`;

        alert(message);
        console.log('🔗 Generated QR Code URL:', qrUrl);
        console.log('📱 QR Code Data (matches riddle):', expectedValue);

        // Try to open in new window
        window.open(qrUrl, '_blank');
        return;
      }
    }

    // Fallback test QR code
    const qrText = 'TEST123';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;

    const message = `Test QR Code: ${qrText}\n\nThis is a generic test QR code.\nNo riddle QR data found.\n\nURL: ${qrUrl}`;

    alert(message);
    console.log('🔗 Test QR Code URL:', qrUrl);
    console.log('📱 Test QR Code Data:', qrText);

    // Try to open in new window
    window.open(qrUrl, '_blank');
  }

  nextRiddle(): void {
    this.currentRiddleIndex++;
    if (this.currentRiddleIndex < this.riddles.length) {
      this.error = '';
      this.loading = true;
      // Save progress to cache
      this.saveCachedProgress();
      // Load complete riddle data for the next riddle
      this.loadCurrentRiddleComplete();
    } else {
      this.completed = true;
      this.currentRiddle = null;
      // Clear cache when hunt is completed
      this.clearCachedProgress();
    }
  }

  navigateBack(): void {
    this.router.navigate(['/hunt']);
  }

  restartHunt(): void {
    this.currentRiddleIndex = 0;
    this.completed = false;
    this.error = '';
    this.loading = true;
    // Clear cached progress when restarting
    this.clearCachedProgress();
    // Load complete riddle data for the first riddle
    this.loadCurrentRiddleComplete();
  }

  ngOnDestroy(): void {
    this.stopQRScanner();
  }
}
