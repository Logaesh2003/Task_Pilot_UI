import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStateService } from '../core/state/task-state.service';
import { TaskService } from '../core/services/task.service';
import { count, filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  tasks: any[] = [];
  stats: any[] = [
    { label: 'Total Tasks', value: 0 },
    { label: 'Completed', value: 0 },
    { label: 'Pending', value: 0 }
  ];

  todayTasks: any[] = [];
  dueTasks: any[] = [];
  activeTab: 'today' | 'due' = 'today';

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();

  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res.tasks ?? [];

      const normalized: any = this.tasks.map((t: any[]) => ({
        id: t[0],
        title: t[2],
        completed: t[6],
        dueDate: t[5],
        description: t[3],
        priority: t[4]
      }));

      this.findStats(normalized);
      this.findTodayTask(normalized);
      this.findDueTasks(normalized);
      console.log(this.tasks)
    });
  }

  findStats(tasks: any) {

    const total = tasks.length;
    const completed = tasks.filter((t: any) => t.completed).length;
    const pending = total - completed;

    this.stats = [
      { label: 'Total Tasks', value: total },
      { label: 'Completed', value: completed },
      { label: 'Pending', value: pending }
    ];

    console.log("stats", this.stats)
  }

  findTodayTask(tasks: any) {
    const todayDate = new Date().toISOString().split('T')[0];
    tasks = tasks.filter((t: any) => t.dueDate && t.dueDate === todayDate && !t.completed)
    tasks.forEach((task: any) => {
      var todayTask = { title: task.title, priority: task.priority }
      this.todayTasks.push(todayTask)
    })
  }

  findDueTasks(tasks: any) {
    const todayDate = new Date().toISOString().split('T')[0];

    // Only show tasks that are overdue (due date is before today and not completed)
    this.dueTasks = tasks
      .filter((t: any) => t.dueDate && !t.completed && t.dueDate < todayDate)
      .map((task: any) => ({
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate
      }))
      .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate));
  }

}
