import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskStateService {

  private tasksSubject = new BehaviorSubject<any[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  refresh$ = new Subject<void>();

  setTasks(tasks: any[]) {
    this.tasksSubject.next(tasks);
  }

  get tasks(): any[] {
    return this.tasksSubject.value;
  }

  requestRefresh() {
    this.refresh$.next();
  }
}
