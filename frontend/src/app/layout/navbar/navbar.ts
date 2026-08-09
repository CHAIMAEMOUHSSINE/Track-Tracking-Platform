import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { FleetDataService, FleetNotification, UserProfile } from '../../core/services/fleet-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly fleet = inject(FleetDataService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);

  readonly session = signal(this.auth.getSession());
  readonly notificationsOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly profileDraft = signal<UserProfile>(this.fleet.profile());
  readonly notificationCount = computed(() => this.fleet.unreadNotifications());
  readonly notifications = computed(() => this.fleet.notifications());
  readonly displayName = computed(() => {
    const profile = this.fleet.profile();
    return `${profile.prenom} ${profile.nom}`;
  });
  readonly roleLabel = computed(() => this.fleet.profile().role ?? this.session()?.role ?? 'Vue opérateur');

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

  openNotification(notification: FleetNotification): void {
    this.fleet.markNotificationAsRead(notification.id);
    this.closeMenus();
    void this.router.navigateByUrl(notification.route);
  }

  markAllAsRead(): void {
    this.fleet.markAllNotificationsAsRead();
  }

  saveProfile(): void {
    this.fleet.updateProfile(this.profileDraft());
    this.closeMenus();
  }

  updateProfileField(field: keyof UserProfile, value: string): void {
    this.profileDraft.update((profile) => ({ ...profile, [field]: value }));
  }

  openPasswordChange(): void {
    this.fleet.changePassword();
    this.closeMenus();
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
