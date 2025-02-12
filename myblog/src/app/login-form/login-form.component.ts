import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [HomeComponent,RouterOutlet,RouterLink,NgIf,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {


  loginForm!:FormGroup;


  ngOnInit(): void {
    this.setForm();

  }


  constructor(private _router:Router,
    private _login:LoginService

  ) { }


  setForm(){
    this.loginForm = new FormGroup({
      email: new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',Validators.required)
    });
  }

  submit(){
    console.log(this.loginForm.value);

    if(this.loginForm.valid){

      this._login.loginUser(this.loginForm.value).subscribe({
        next: (resp) => {
          console.log(resp);
          alert('Login Successfull!');
          this._router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
        }, // Add a comma here
      });
      console.log('Form is valid');
      
    }
    else{
      console.log('Form is invalid');
    }

  }

}
