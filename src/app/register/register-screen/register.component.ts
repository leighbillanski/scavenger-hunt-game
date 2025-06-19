import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RegisterService} from "../register-service/register.service";
import {RegisterFilter} from "../register-service/register.filter";

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
    private service: RegisterService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Register');
    this.buildForm();
  }

  backButtonClicked(): void {
    this.router.navigate(['/welcome']);
  }

  registerButtonClicked(): void {
    let filter = new RegisterFilter();
    filter.email = this.registrationFormGroup.get('email')?.value;
    filter.userName = this.registrationFormGroup.get('userName')?.value;
    filter.password = this.registrationFormGroup.get('password')?.value;
    filter.confirmPassword = this.registrationFormGroup.get('confirmPassword')?.value;
    filter.role = this.registrationFormGroup.get('role')?.value;
    // console.log('Registering user with filter:', filter);
    this.service.register(filter).subscribe({
      next: (response) => {
        console.log('Registration successful');
        this.router.navigate(['/welcome']);
      },
      error: (error) => {
        console.error('Registration failed', error);
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
      role: ['', Validators.required]
    });
  }

}
