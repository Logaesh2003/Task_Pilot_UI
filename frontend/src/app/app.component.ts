import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { NavbarComponent } from './shared/components/navbar/navbar.component';
// import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    onLogout() {
        console.log('Logout clicked');
    }

}
