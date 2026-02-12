import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { TaskStateService } from '../../core/state/task-state.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

interface Task {
  id: number;
  title: string;
  description: string;
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

  constructor(private router: Router, private taskState: TaskStateService) {

  }


  ngOnInit(): void {

    this.taskState.tasks$.subscribe(tasks => {
      this.tasks = tasks
      console.log("Tasks in ngOnInit : ", this.tasks);
    });

  }

  loadTasks() {
    this.service.getTasks().subscribe(tasks => {
      this.taskState.setTasks(tasks);
    });
  }



  toggleSubtasks(taskId: number) {
    this.expandedTaskId =
      this.expandedTaskId === taskId ? null : taskId;
  }


  toggleTask(task: Task) {
    task.completed = !task.completed;

    this.service.toggleTask(task.id).subscribe({
      next: res => {
        console.log("Task completion status is toggled")
      },
      error: err => console.log(err)
    })
  }

  /* -------- Subtasks -------- */

  toggleSubtask(task: any, sub: any) {
    sub.completed = !sub.completed;

    let totalCompletedSubtasks = task.subtasks?.filter((s: any) => s.completed).length;

    if (totalCompletedSubtasks === task.subtasks?.length) {
      this.toggleTask(task);
    }

    this.service.toggleSubtask(sub.id).subscribe({
      next: () => console.log(`Subtask of id ${sub.id} is toggled`),
      error: () => console.log(`Error toggling subtask`)
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
    await this.deleteTask(task.id);

  }


  deleteTask(taskId: number) {

    this.service.deleteTask(taskId).subscribe({
      next: res => {
        console.log(res);
        this.taskState.requestRefresh();
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        if (this.tasks.length === 0) {
          console.log("Going inside if")
          this.tasks = [];
          this.taskState.setTasks(this.tasks);
          // this.router.navigate(["/tasks"]);
        }

      },
      error: err => console.log(err)
    })

  }


  // Helper Functions to use the services
  fetchAllTask() {

    this.isLoading = true;
    this.error = '';

    this.service.getTasks().subscribe({
      next: res => {
        const result = res.tasks ?? [];
        result.forEach((value: any[]) => {
          const task = {
            id: value[0],
            title: value[2],
            due: value[3],
            completed: value[4],
            description: value[5]
          };
          this.tasks.push(task);
        });
        const subtaskCalls = this.tasks.map((t: any) =>
          this.service.getSubtasks(t.id)
        );

        forkJoin(subtaskCalls).subscribe((subtasksList: any) => {
          const normalized = this.tasks.map((task: any, i: number) => ({
            ...task,
            subtasks: subtasksList[i] || []
          }));

          this.tasks = normalized;
        });
        this.isLoading = false;
        console.log(res)
        this.taskState.requestRefresh();
      },
      error: err => {
        console.log('Error', err)
        this.error = 'Failed to load tasks';
        this.isLoading = false;
      }
    })

  }

}
