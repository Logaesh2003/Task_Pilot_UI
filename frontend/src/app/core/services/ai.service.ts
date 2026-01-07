import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiStructuredResponse } from '../ai.models';

export interface AiSuggestion {
  title: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly API_URL = 'http://localhost:8000/llm';

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


 streamAskAi(
  payload: {
    prompt: string;
    context: string;
    tasks: any[];
  },
  onMessage: (chunk: string) => void,
  onDone: () => void,
  onError: () => void
) {
  fetch('http://localhost:8000/llm/ask-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async response => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.replace('data: ', '').trim();
            if (chunk === '[DONE]') {
              onDone();
              return;
            }
            onMessage(chunk);
          }
        }
      }
    })
    .catch(() => {
      onError();
    });
}


}
