import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true; // Let SSR pass, client will handle the actual logic
  }
  
  if (authService.currentUserValue) {
    return true;
  }
  
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', redirectTo: '/reminders', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reminders', component: ReminderListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/reminders' }
];
