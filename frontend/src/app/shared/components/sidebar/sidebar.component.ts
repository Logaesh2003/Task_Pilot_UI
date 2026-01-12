import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})





export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Tasks', icon: '✅', route: '/tasks' }
  ];

  aiRoute = "/ai";

  collapsed = false;
  expanded = true;

  ngOnInit() {
    this.handleResize();
  }

  @HostListener('window:resize')
  handleResize() {
    this.expanded = window.innerWidth > 1024;
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

}
