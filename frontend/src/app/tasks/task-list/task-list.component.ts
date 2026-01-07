import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { TaskStateService } from '../../core/state/task-state.service';
import { Router } from '@angular/router';


interface Task {
  id: number;
  title: string;
  description : string;
  completed: boolean;
  due: string;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})

export class TaskListComponent implements OnInit {

  service = inject(TaskService)

  expandedTaskId: number | null = null;
  tasks: any[] = [];   
  isLoading = false;
  error = '';

  constructor(private router : Router, private taskState : TaskStateService){

  }


  ngOnInit(): void {

    this.taskState.tasks$.subscribe(tasks => {
      this.tasks = tasks;
    });
    // this.taskState.requestRefresh();
    // this.fetchAllTask();   // ✅ runs on component load
  }


  toggleSubtasks(taskId: number) {
    this.expandedTaskId =
      this.expandedTaskId === taskId ? null : taskId;
  }


  toggleTask(task: Task) {
    task.completed = !task.completed;

    this.service.toggleTask(task.id).subscribe({
      next : res =>{
        console.log("Task completion status is toggled")
      },
      error : err => console.log(err)
    })
  }

  /* -------- Subtasks -------- */

toggleSubtask(sub : any) {
  sub.completed = !sub.completed;

  this.service.toggleSubtask(sub.id).subscribe({
    next : () => console.log(`Subtask of id ${sub.id} is toggled`),
    error : () => console.log(`Error toggling subtask`)
  });
}

deleteSubtask(taskId: number, subtaskId: number) {
  this.service.deleteSubtask(subtaskId).subscribe(() => {
    const task = this.tasks.find(t => t.id === taskId);
    task.subtasks = task.subtasks.filter(
      (s: any) => s.id !== subtaskId
    );
  });
}

  async confirmDelete(task: Task) {
    // const confirmed = confirm(`Delete task "${task.title} with task_id ${task.id}"?`);

    // if (!confirmed) return;

    await this.deleteTask(task.id);
  }


  deleteTask(taskId: number) {
    // 🔗 Later: call backend DELETE /tasks/:id
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  
    this.service.deleteTask(taskId).subscribe({
      next : res => {
        console.log(res);
        this.taskState.requestRefresh();
      },
      error : err => console.log(err)
    })

  }


  // Helper Functions to use the services
  fetchAllTask() {

    this.isLoading = true;
    this.error = '';

    this.service.getTasks().subscribe({
      next : res => {
        const result = res.tasks ?? [];
        result.forEach((value: any[]) => {
          const task = {
            id: value[0],
            title: value[2],
            due: value[3],
            completed: value[4],
            description : value[5]
          };
          this.tasks.push(task);
        });
        this.isLoading = false;
        console.log(res)
    },
      error : err => {
        console.log('Error',err)
        this.error = 'Failed to load tasks';
        this.isLoading = false;
      }
    })
    
  }

}
