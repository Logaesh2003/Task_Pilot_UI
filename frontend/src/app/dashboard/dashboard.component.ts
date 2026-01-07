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
  stats : any[] = [
    { label: 'Total Tasks', value: 0 },
    { label: 'Completed', value: 0 },
    { label: 'Pending', value: 0 }
  ];
  
  todayTasks : any[] = [];

  constructor(private taskService : TaskService){}

  ngOnInit(): void {
    this.loadTasks();
    
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res.tasks ?? [];

      const normalized: any = this.tasks.map((t: any[]) => ({
        id: t[0],
        title: t[2],
        completed: t[4],
        dueDate: t[3],
        description: t[5],
        priority: t[6]
      }));

      this.findStats(normalized);
      this.findTodayTask(normalized);
      console.log(this.tasks)
    });
  }

  findStats(tasks : any){
    

    const total = tasks.length;
    const completed = tasks.filter((t:any) => t.completed).length;
    const pending = total - completed;

    this.stats = [
      { label: 'Total Tasks', value: total },
      { label: 'Completed', value: completed },
      { label: 'Pending', value: pending }
    ];

    console.log("stats", this.stats)
  }

  findTodayTask(tasks : any){
    const todayDate = new Date().toISOString().split('T')[0];
    tasks = tasks.filter((t : any) => t.dueDate && t.dueDate <= todayDate && !t.completed )
    tasks.forEach((task:any) =>{
      var todayTask = { title : task.title, priority : task.priority }
      this.todayTasks.push(todayTask)
    })
  }

}
