import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { RiddleScannerComponent } from './riddle-scanner.component';
import { RiddleService } from '../../services/riddle/riddle.service';
import { Title } from '@angular/platform-browser';

describe('RiddleScannerComponent', () => {
  let component: RiddleScannerComponent;
  let fixture: ComponentFixture<RiddleScannerComponent>;
  let mockRiddleService: jasmine.SpyObj<RiddleService>;
  let mockTitle: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    const riddleServiceSpy = jasmine.createSpyObj('RiddleService', ['getAllRiddles']);
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [ RiddleScannerComponent ],
      imports: [ 
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: RiddleService, useValue: riddleServiceSpy },
        { provide: Title, useValue: titleSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ huntId: 1 })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiddleScannerComponent);
    component = fixture.componentInstance;
    mockRiddleService = TestBed.inject(RiddleService) as jasmine.SpyObj<RiddleService>;
    mockTitle = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  beforeEach(() => {
    mockRiddleService.getAllRiddles.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set title on init', () => {
    component.ngOnInit();
    expect(mockTitle.setTitle).toHaveBeenCalledWith('Riddle Scanner');
  });

  it('should load riddles on init', () => {
    const mockRiddles = [
      { id: 1, riddleText: 'Test riddle 1', sequence: 1, qrCode: { qrData: 'test1' } },
      { id: 2, riddleText: 'Test riddle 2', sequence: 2, qrCode: { qrData: 'test2' } }
    ];
    mockRiddleService.getAllRiddles.and.returnValue(of(mockRiddles));

    component.ngOnInit();

    expect(mockRiddleService.getAllRiddles).toHaveBeenCalledWith(1);
    expect(component.riddles).toEqual(mockRiddles);
    expect(component.currentRiddle).toEqual(mockRiddles[0]);
  });

  it('should handle QR code detection correctly', () => {
    component.currentRiddle = { qrCode: { qrData: 'test123' } };
    component.riddles = [component.currentRiddle, { qrCode: { qrData: 'test456' } }];
    spyOn(component, 'nextRiddle');

    component.onQRCodeDetected('test123');

    expect(component.nextRiddle).toHaveBeenCalled();
  });

  it('should set error for incorrect QR code', () => {
    component.currentRiddle = { qrCode: { qrData: 'test123' } };
    
    component.onQRCodeDetected('wrong123');

    expect(component.error).toContain('QR code does not match');
  });

  it('should complete hunt when all riddles are solved', () => {
    component.riddles = [{ id: 1 }, { id: 2 }];
    component.currentRiddleIndex = 1;

    component.nextRiddle();

    expect(component.completed).toBe(true);
    expect(component.currentRiddle).toBeNull();
  });
}); 