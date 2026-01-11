import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskCreateComponent } from './tasks/task-create/task-create.component';
import { AppLayoutComponent } from './layout/app-layout.component';
import { TaskEditComponent } from './tasks/task-edit/task-edit.component';

export const routes: Routes = [
  //  {
  //   path: '',
  //   redirectTo: 'login',
  //   pathMatch: 'full'
  // },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tasks', component: TaskListComponent },
      { path: 'tasks/new', component: TaskCreateComponent },
      { path: 'tasks/:id/edit', component: TaskEditComponent }
    ]
  }
];
