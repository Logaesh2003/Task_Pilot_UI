import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { TaskStateService } from '../../core/state/task-state.service';

interface Task {
  task_id: number;
  title: string;
  description : string;
  dueDate: string;
  priority: string;
}


@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  taskForm!: FormGroup;
  isSubmitting = false;
  taskId!: number;
  service = inject(TaskService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskState : TaskStateService

  ) {}

  mockTask = {
    title: '',
    description: '',
    dueDate: '',
    priority: ''
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));

    this.taskForm = this.fb.group({
      title: [''],
      description: [''],
      dueDate: [''],
      priority: ['']
    });

    this.fetchTask(this.taskId);
    
  }

  submit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    console.log('Updating task', this.taskId, this.taskForm.value);

    const payload = {
      task_id : this.taskId,
      title: this.taskForm.value.title,
      description : this.taskForm.value.description,
      dueDate: this.taskForm.value.dueDate,
      priority: this.taskForm.value.priority
    }

    this.updateTask(payload);

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/tasks']);
    }, 600);
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }

  fetchTask(task_id : number){
    this.service.fetchSingleTask(task_id).subscribe({
      next : res => {

        console.log(res)

        const result = res.task[0] ?? [];
        
        this.mockTask.title = result[2],
        this.mockTask.dueDate = result[3],
        this.mockTask.priority = result[6],
        this.mockTask.description = result[5]

        this.taskForm.patchValue(this.mockTask)  

        // this.taskForm = this.fb.group({
        //   title: [this.mockTask.title, Validators.required],
        //   description: [this.mockTask.description],
        //   dueDate: [this.mockTask.dueDate],
        //   priority: [this.mockTask.priority, Validators.required]
        // });
    
        console.log(this.mockTask)
      },
      error : err => console.log(err)
    })
  }

  updateTask(task : Task){
    this.service.updateTask(task).subscribe({
      next : res => {
        console.log(res);
        this.taskState.requestRefresh();
      },
      error : err => console.log(err)
    })
  }


}
