import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {UserFilter} from "../../services/user/user.filter";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  public loginFormGroup: FormGroup = this.formBuilder.group({});

  constructor(
    private router: Router,
    private title: Title,
    private formBuilder: FormBuilder,
    private service: UserService
  ) {
  }
  ngOnInit(): void {
    this.title.setTitle('Login');
    this.buildForm();
  }

  backButtonClicked(): void {
    this.router.navigate(['/welcome']);
  }

  buildForm() {
    this.loginFormGroup = this.formBuilder.group({
      userName: [''],
      password: ['']
    });
  }

  loginButtonClicked() {
    const filter = new UserFilter();
    filter.userName = this.loginFormGroup.get('userName')?.value;
    filter.password = this.loginFormGroup.get('password')?.value;

    this.service.login(filter).subscribe({
      next: (response: any) => {
        console.log('Login successful');
        this.service.setLoggedInUser(response.user || response); // Save user info
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
