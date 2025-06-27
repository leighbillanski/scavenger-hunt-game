import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserFilter} from "../../services/user/user.filter";
import {UserService} from "../../services/user/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  public registrationFormGroup: FormGroup = new FormGroup({});

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private title: Title,
    private service: UserService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Register');
    this.buildForm();
  }

  backButtonClicked(): void {
    this.router.navigate(['/welcome']);
  }

  registerButtonClicked(): void {
    let filter = new UserFilter();
    let password = this.registrationFormGroup.get('password')?.value;
    let confirmPassword = this.registrationFormGroup.get('confirmPassword')?.value;
    filter.email = this.registrationFormGroup.get('email')?.value;
    filter.userName = this.registrationFormGroup.get('userName')?.value;
    if (password == confirmPassword) {
      filter.password = this.registrationFormGroup.get('password')?.value;
    } else {
      console.error('Passwords do not match');
      return;
    }
    filter.role = 'Hunter';
    this.service.register(filter).subscribe({
      next: (response) => {
        console.log('Registration successful');
        this.router.navigate(['/user/login']);
      },
      error: (error) => {
        alert(error.error.message || 'Registration failed');
      }
    });
  }

  buildForm() {
    // Initialize the form builder here if needed
    this.registrationFormGroup = this.formBuilder.group({
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

}
