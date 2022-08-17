import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  constructor(
    public fb: FormBuilder,
    public storage: StorageService,
    public router: Router,
    public authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: [
        '',
        Validators.compose([Validators.required, Validators.minLength(5)]),
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      console.log('invalid form');
      return;
    }
    this.errorMsg = '';
    const formData = {
      username: this.loginForm.controls.username.value,
      password: this.loginForm.controls.password.value,
    };
    this.authService.login(formData).subscribe(
      async (resp) => {
        console.log('login resp', resp);
        this.router.navigateByUrl('/page/home', { replaceUrl: true });
      },
      (err) => {
        this.errorMsg = err.message;
        console.log('error', err);
      }
    );
  }
}
