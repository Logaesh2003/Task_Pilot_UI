import { Component, Input, OnChanges, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ViewChild, ElementRef, NgZone } from '@angular/core';
import { filter } from 'rxjs/operators';
import {ActivatedRoute,Router } from '@angular/router';

import { AiService, AiSuggestion } from '../../core/services/ai.service';
import { AiAskInputComponent } from '../ai-ask-input/ai-ask-input.component';
import { AiStructuredResponse } from '../../core/ai.models';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { TaskService } from '../../core/services/task.service';
import { TaskStateService } from '../../core/state/task-state.service';



@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [CommonModule, AiAskInputComponent],
  animations: [
    trigger('aiCards', [
      transition(':enter', [
        query('.ai-card', [
          style({ opacity: 0, transform: 'translateY(8px)' }),
          stagger(80, [
            animate(
              '500ms cubic-bezier(0.22, 1, 0.36, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ]),

    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate(
          '500ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ])
  ],
  templateUrl: './ai-panel.component.html',
  styleUrls: ['./ai-panel.component.scss']
})
export class AiPanelComponent implements OnInit{

  tasks: any[] = [];
  context : any[] =  [];
  @ViewChild('aiScroll') aiScroll!: ElementRef<HTMLDivElement>;



  expanded = true;

  mode: 'initial' | 'streaming' = 'initial';
  aiResponse?: any;
  subtasksCreated = false

  isLoading = false;
  isThinking = false;
  error = '';
  suggestions: AiSuggestion[] = [];
  starterQuestions = [
    'What should I focus on today?',
    'Help me plan my day',
    'Can you break these tasks into subtasks?',
    'Can you give a detailed schedule for today?'
  ];

  constructor(private aiService: AiService, private route : ActivatedRoute,private router : Router, private zone: NgZone, private taskService : TaskService, private taskState : TaskStateService) {
    
  }

  @HostListener('window:resize')
  handleResize() {
    this.expanded = window.innerWidth > 900;
    if(this.expanded){
      this.router.navigate(['/dashboard']);
    }
  }


  ngOnInit() {

    this.taskState.tasks$.subscribe(tasks => {
      this.error = '';
      this.subtasksCreated = false; 
      this.tasks = tasks;
      if (this.tasks.length > 0) {
        this.isThinking = true;
        this.aiResponse = undefined;
        this.loadInitialSuggestions();
      }
      else if(this.tasks.length === 0){
        this.isLoading = false;
        this.isThinking = false;
        this.suggestions = [];
      }
    });

  }

  onAsk(prompt: string) {

    // 🔑 clear rule-based suggestions
    this.aiResponse = undefined;
    this.suggestions = [];
    this.isThinking = true;
    this.error = ''
    

    console.log("Payload sent to LLM OnAsk, ", this.tasks)
    this.aiService.askAi({prompt,context: this.context,tasks: this.tasks}).subscribe({
        next : res => {
          setTimeout(() => {   // 👈 artificial thinking delay
          this.isThinking = false;
          this.aiResponse = res;
          this.scrollAfterRender();
        }, 2000); // 600–900ms is ideal
        },
        error: () => {
        this.isThinking = false;
        this.error = 'AI failed to respond. Please try again...';
      }
    });

  }

  onFollowUp(question: string) {

      this.aiResponse = undefined;
      this.isThinking = true;
      this.error = '';

    
        this.aiService.askAi({prompt: question,context: this.context,tasks: this.tasks}).subscribe({
          next: (res) => {
          setTimeout(() => {   // 👈 artificial thinking delay
              this.isThinking = false;
              this.aiResponse = res;
              console.log("AI Response : ",this.aiResponse)
              this.scrollAfterRender();
            }, 2000); // 600–900ms is ideal
          },
          error: () => {
            this.isThinking = false;
            this.error = 'AI failed to respond. Please try again...';
          }
        });
      
      
    }



  loadInitialSuggestions() {

    // Normalize tasks (same mapping you already do)
    console.log("Initial suggestion payload : ", this.tasks)

    this.aiService.getSuggestions({ tasks : this.tasks} ).subscribe({
        next: (res) => {
          setTimeout(() => {   // 👈 artificial thinking delay
            this.suggestions = res.suggestions;
            this.isThinking = false;
            this.scrollAfterRender();
          }, 2000); // 600–900ms is ideal
          
        },
        error: () => {
          this.suggestions = [];
          this.isThinking = false;
          this.isLoading = false;
          this.error = 'AI failed to respond. Please try again...';
        }
      });
  }

  onStarterQuestionClick(question: string) {
    this.onAsk(question);
  }


  replaceSubtasks() {

    this.isThinking = true;

    if (!this.aiResponse?.items?.length) {
      console.error('AI response missing items');
      return;
    }

    // We replace subtasks PER parent task
    this.aiResponse.items.forEach((group: any) => {

      const payload = {
        parentTaskId: group.parentTaskId,
        subtasks: group.subtasks.map((s: any) => ({
          title: s.title,
          estimate: s.estimate,
          priority: s.priority
        }))
      };

      console.log('✅ Sending payload:', payload);

      this.aiService.replaceSubtasks(payload).subscribe({
        next: () => {
          this.subtasksCreated = true; 
        },
        error: err => console.error(err)
      });

    });

    this.taskState.requestRefresh(); // refresh task list
    this.isThinking = false;
}



  private scrollAfterRender() {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      });
    });
  }

  private scrollToBottom() {
    if (!this.aiScroll) return;

    this.aiScroll.nativeElement.scrollTo({
      top: this.aiScroll.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
  }


}
