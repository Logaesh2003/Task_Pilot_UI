import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-ask-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-ask-input.component.html',
  styleUrls: ['./ai-ask-input.component.scss']
})
export class AiAskInputComponent {

  @Output() ask = new EventEmitter<string>();

  prompt = '';
  isLoading = false;

  submit() {
    const value = this.prompt.trim();
    if (!value || this.isLoading) return;

    this.isLoading = true;
    this.ask.emit(value);

    // Temporary UX (until backend responds)
    setTimeout(() => {
      this.isLoading = false;
      this.prompt = '';
    }, 600);
  }
}
