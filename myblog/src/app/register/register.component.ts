import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,RouterOutlet,RouterModule,ReactiveFormsModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userRegForm!:FormGroup;
  private _router: any;

  constructor(private _register:RegisterService,
    _router:Router
  ){

  }
  ngOnInit():void{
    this.setForm();
  }

  setForm(){
    this.userRegForm = new FormGroup({
      firstName: new FormControl('',[Validators.required]),
      lastName: new FormControl('',[Validators.required]),
      email: new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',[Validators.required,Validators.minLength(8)]),
      confirmPassword: new FormControl('',[Validators.required,Validators.minLength(8)]),
    })
  }

  register(){
    console.log(this.userRegForm.value);
    console.log(this.userRegForm.valid);
    
    if(this.userRegForm.valid){
      this._register.registerUser(this.userRegForm.value).subscribe((data:any)=>{
        console.log(data);
  
        alert(data.msg);
        this.userRegForm.reset();
      })
    }
    else{
      alert("enter valid details!")
    }
    this._router.navigate(['home']);
    
  }

}
