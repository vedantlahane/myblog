import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormControl, FormsModule,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-writeblog',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterOutlet,FormsModule,ReactiveFormsModule],
  templateUrl: './writeblog.component.html',
  styleUrl: './writeblog.component.css'
})
export class WriteblogComponent {
  blogForm!: FormGroup;

  constructor(private _writeblog: BlogService, private _router: Router) {}

  ngOnInit(): void {
    this.setForm();
  }

  setForm(): void {
    this.blogForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('', [Validators.required]),
    });
  }

  writeBlog(): void {
    if (this.blogForm.valid) {
      this._writeblog.writeBlog(this.blogForm.value).subscribe((data: any) => {
        console.log(data);
        // alert(data.msg);
        this.blogForm.reset();
        this._router.navigate(['home']);
      });
    } else {
      alert("Please enter valid details!");
    }
  }
}