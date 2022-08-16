import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import apiRoutes from 'src/app/config/apiRoutes';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  constructor(
    private http: HttpService,
    public formBuilder: FormBuilder,
    public storage: StorageService,
    public navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
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

  checkAuth() {}

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
    this.http.post(apiRoutes.LOGIN, formData).subscribe(
      async (resp) => {
        if (resp.token) {
          await this.storage.setItem('user', resp);
          this.navCtrl.navigateRoot('/page/home');
        }
      },
      (err) => {
        this.errorMsg = err.message;
        console.log('error', err);
      }
    );
  }
}
