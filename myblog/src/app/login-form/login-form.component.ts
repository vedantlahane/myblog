import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../services/register.service';
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
  constructor(private _regiter:RegisterService) { }

  setForm(){
    this.loginForm = new FormGroup({
      email: new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',Validators.required)
    });
  }

  submit(){
    console.log(this.loginForm.value);

    if(this.loginForm.valid){
      console.log('Form is valid');
      alert('Login Successfull!');
    }
    else{
      console.log('Form is invalid');
    }

  }

}
