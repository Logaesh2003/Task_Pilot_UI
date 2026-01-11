import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiStructuredResponse } from '../ai.models';
import { environment } from '../../environments/environment';

export interface AiSuggestion {
  title: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly API_URL = `${environment.apiURL}/llm`;

  constructor(private http: HttpClient) {}

  getSuggestions(payload : {tasks : any[]}) {
    const url = `${this.API_URL}/initial-suggestions`
    return this.http.post<{ suggestions: any[] }>(
      url,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  createSubtask(subtasks : any){
    const url = `${this.API_URL}/subtasks/create`
    return this.http.post(url, { subtasks })
  }

  replaceSubtasks(payload: {
    parentTaskId: number;
    subtasks: any[];
  }) {

    console.log("AI payload in aiservice ",payload);
    return this.http.post(
      `${this.API_URL}/subtasks/replace`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }


  askAi( payload : any) : Observable<any>{

    const url = `${this.API_URL}/ask`

    // const payload = {
    //     prompt,
    //     context: 'dashboard',
    //     tasks: this.tasks
    // }

    return this.http.post<AiStructuredResponse>(
        url, payload
    );
 }


}
