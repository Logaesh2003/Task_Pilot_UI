import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = `${environment.apiURL}/tasks`;

  constructor(private http: HttpClient) {}

  // GET all tasks for logged-in user
  getTasks(): Observable<any> {
    const url = `${this.API_URL}/search`
    return this.http.get(url,{ headers: { 'Content-Type': 'application/json' } });
  }

  // CREATE task
  createTask(payload : Partial<any>): Observable<any> {
    const url = `${this.API_URL}/create`
    return this.http.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  }

  // UPDATE task
  updateTask(payload: Partial<any>): Observable<any> {
    const url = `${this.API_URL}/update`
    return this.http.put<Task>(url, payload, {headers : {'Content-Type': 'application/json' } });
  }

  // DELETE task
  deleteTask(id: number): Observable<any> {
    const url = `${this.API_URL}/delete`;
    const payload = { "task_id" : id };
    return this.http.post(url, payload, {headers : { 'Content-Type' : 'application/json '} });
  }

  // Get single task
  fetchSingleTask(id: number): Observable<any> {
    const url = `${this.API_URL}/getTask`;
    const payload = { "task_id" : id };
    return this.http.post(url, payload, {headers : { 'Content-Type' : 'application/json '} });
  }

  toggleTask(id: number): Observable<any> {
    console.log("Toggle ID", id)
    const url = `${this.API_URL}/toggleTask`;
    const payload = { "task_id" : id };
    return this.http.put(url, payload, {headers : { 'Content-Type' : 'application/json '} });
  }

  getSubtasks(taskId: number) {
    return this.http.get<any[]>(`${this.API_URL}/${taskId}/subtasks`,  {headers : { 'Content-Type' : 'application/json '} });
  }

  toggleSubtask(subtaskId: number): Observable<any> {
    console.log("Toggle ID", subtaskId)
    const url = `${this.API_URL}/toggleSubtask`;
    const payload = { "id" : subtaskId };
    return this.http.put(url, payload, {headers : { 'Content-Type' : 'application/json '} });
  }

  deleteSubtask(subtaskId: number): Observable<any> {
    const url = `${this.API_URL}/deleteSubtask`;
    const payload = { "id" : subtaskId };
    return this.http.post(url, payload, {headers : { 'Content-Type' : 'application/json '} });
  }
}
