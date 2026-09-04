import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        ScheduleComponent
    ],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cleaning-schedule';
  protected themeService = inject(ThemeService);
}
