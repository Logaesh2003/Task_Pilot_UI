import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { AuthService } from '../core/services/auth.service';
import { AiPanelComponent } from '../ai/ai-panel/ai-panel.component';
import { TaskService } from '../core/services/task.service';
import { TaskStateService } from '../core/state/task-state.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, AiPanelComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {

  tasks: any[] = [];

  constructor(
    private taskService: TaskService,
    private taskState: TaskStateService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.loadTasks();

    // 🔑 React to refresh requests
    this.taskState.refresh$.subscribe(() => {
      this.tasks = []
      this.loadTasks();
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {

      const result = res.tasks ?? [];
        result.forEach((value: any[]) => {
          const task = {
            id: value[0],
            title: value[2],
            dueDate: value[5],
            completed: value[6],
            description : value[3],
            priority : value[4]
          };
          this.tasks.push(task);
        });

      const subtaskCalls = this.tasks.map((t : any) =>
        this.taskService.getSubtasks(t.id)
      );

      forkJoin(subtaskCalls).subscribe((subtasksList : any) => {
        const normalized = this.tasks.map((task : any, i : number) => ({
          ...task,
          subtasks: subtasksList[i] || []
        }));

        this.taskState.setTasks(normalized);
      });
    });
  }

  // loadTasksForAI() {
  //   this.taskService.getTasks().subscribe({
  //     next: (res) => {
  //       this.tasks = res.tasks;
  //     }
  //   });
  // }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
