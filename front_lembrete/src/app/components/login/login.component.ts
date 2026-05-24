import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card glass-card hover-scale">
        <mat-card-header style="justify-content: center; margin-bottom: 16px;">
          <mat-card-title class="gradient-text" style="font-size: 28px;">Bem-vindo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="password" required>
            </mat-form-field>
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button color="primary" mat-raised-button type="submit" [disabled]="loginForm.invalid || isLoading" class="full-width mt-2" style="height: 48px; font-size: 16px;">
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
          <div class="register-link mt-3 text-center">
            <span style="color: var(--text-secondary)">Não tem conta?</span> <a routerLink="/register" style="color: var(--accent-primary); font-weight: 500; text-decoration: none;">Registre-se</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 64px);
      background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 500px),
                  radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent 500px);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 32px 24px;
    }
    .full-width {
      width: 100%;
    }
    .mt-2 { margin-top: 16px; }
    .mt-3 { margin-top: 24px; }
    .text-center { text-align: center; }
    .error-message {
      color: var(--error);
      font-size: 14px;
      margin-bottom: 16px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginForm.value as any).subscribe({
        next: () => {
          this.router.navigate(['/reminders']);
        },
        error: (err) => {
          this.errorMessage = 'Usuário ou senha inválidos';
          this.isLoading = false;
        }
      });
    }
  }
}
