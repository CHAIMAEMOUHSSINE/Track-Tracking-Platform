import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { FleetDataService } from '../../core/services/fleet-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly fleet = inject(FleetDataService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly session = signal(this.auth.getSession());
  readonly notificationsOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly notificationCount = computed(() => this.fleet.notifications().length);
  readonly notifications = computed(() => this.fleet.notifications());
  readonly displayName = computed(() => {
    const session = this.session();
    return session ? `${session.prenom} ${session.nom}` : 'Responsable Logistique';
  });
  readonly roleLabel = computed(() => this.session()?.role ?? 'Vue opérateur');

  toggleNotifications(): void {
    this.profileOpen.set(false);
    this.notificationsOpen.update((value) => !value);
  }

  toggleProfile(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.update((value) => !value);
  }

  closeMenus(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenus();
    void window.location.assign('/login');
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenus();
    }
  }

}
