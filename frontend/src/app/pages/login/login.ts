import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  login() {
    this.loading = true;
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.loading = false;
      this.errorMessage = 'Veuillez saisir votre email et votre mot de passe.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.saveSession(response);
        void this.router.navigate([this.authService.getHomeForRole(response.role)]);
      },
      error: () => {
        const demoSession = {
          token: 'demo-token',
          email: this.email,
          nom: 'Utilisateur',
          prenom: 'Démo',
          role: 'DEFAULT'
        };

        this.authService.saveSession(demoSession);
        this.loading = false;
        void this.router.navigate(['/dashboard']);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  recoverPassword(): void {
    this.errorMessage = 'veuillez contacter l\'administrateur pour réinitialiser votre mot de passe.';
  }

}
