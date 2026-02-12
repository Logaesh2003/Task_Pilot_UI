import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { TaskStateService } from '../../core/state/task-state.service';

export interface Task {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: string;
}

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})


export class TaskCreateComponent {
  isSubmitting = false;
  taskForm: FormGroup;
  service = inject(TaskService)
  error = '';


  constructor(private fb: FormBuilder, private router: Router, private taskState: TaskStateService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [`${new Date().toISOString().split('T')[0]}`],
      priority: ['Medium', Validators.required]
    });
  }


  async submit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    // 🔗 Later: call TaskService → backend
    const task = this.taskForm.value;
    console.log("Creating task, sending payload to backend ..")

    const response = await this.createTask(task)
    console.log(this.taskForm.value);

    // Temporary UX
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/tasks']);
    }, 600);
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }

  async createTask(tasks: Task) {

    this.service.createTask(tasks).subscribe({
      next: res => {
        console.log('Success', res);
        this.taskState.requestRefresh();
      },
      error: err => console.error('Error', err)
    });

  }
}
