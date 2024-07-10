import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ScheduleComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cleaning-schedule';
}
