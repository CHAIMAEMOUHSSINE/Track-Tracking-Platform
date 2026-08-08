import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

const STORAGE_KEY = 'holcim_sidebar_collapsed';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  collapsed = signal(localStorage.getItem(STORAGE_KEY) === 'true');

  toggle(): void {
    this.collapsed.update((v) => !v);
    localStorage.setItem(STORAGE_KEY, String(this.collapsed()));
  }
}
