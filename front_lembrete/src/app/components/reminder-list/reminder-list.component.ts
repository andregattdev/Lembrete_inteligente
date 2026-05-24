import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReminderService } from '../../services/reminder.service';
import { AuthService } from '../../services/auth.service';
import { Reminder, ReminderRequest } from '../../models/reminder';
import { ReminderFormComponent } from '../reminder-form/reminder-form.component';

@Component({
  selector: 'app-reminder-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, 
    MatIconModule, MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule
  ],
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.css']
})
export class ReminderListComponent implements OnInit, OnDestroy {
  private reminderService = inject(ReminderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  reminders: Reminder[] = [];

  // Filter states
  searchText = '';
  selectedPriority = 'ALL';
  selectedCategory = 'ALL';
  selectedStatus = 'ALL';

  // Alarm system
  private alarmInterval: any;
  private alertedIds = new Set<number>();

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadReminders();
      this.startAlarmMonitor();
    }
  }

  ngOnDestroy() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
    }
  }

  loadReminders() {
    const user = this.authService.currentUserValue;
    if (!user || !user.id) {
      return;
    }
    this.reminderService.getAll().subscribe({
      next: (data) => {
        this.reminders = data;
        this.cdr.detectChanges();
      },
      error: (err) => this.showError('Erro ao carregar lembretes')
    });
  }

  // Dashboard calculations
  get totalCount(): number {
    return this.reminders.length;
  }

  get pendingCount(): number {
    return this.reminders.filter(r => !r.completed).length;
  }

  get completedCount(): number {
    return this.reminders.filter(r => r.completed).length;
  }

  get overdueCount(): number {
    return this.reminders.filter(r => !r.completed && this.isOverdue(r)).length;
  }

  isOverdue(reminder: Reminder): boolean {
    if (!reminder.dueDate || reminder.completed) return false;
    return new Date(reminder.dueDate).getTime() < new Date().getTime();
  }

  // Categories helper
  get uniqueCategories(): string[] {
    const cats = this.reminders.map(r => r.category || 'Geral');
    return Array.from(new Set(cats));
  }

  // Category Color Map
  getCategoryColor(category: string): string {
    switch (category?.toLowerCase()) {
      case 'trabalho': return '#8b5cf6'; // Indigo
      case 'pessoal': return '#ec4899';  // Pink
      case 'estudos': return '#f59e0b';  // Amber
      case 'saúde': case 'saude': return '#10b981'; // Green
      case 'finanças': case 'financas': return '#06b6d4'; // Teal
      default: return '#6b7280'; // Slate/Muted
    }
  }

  // Live filtered list
  get filteredReminders(): Reminder[] {
    return this.reminders.filter(r => {
      const matchesSearch = !this.searchText || 
        r.title.toLowerCase().includes(this.searchText.toLowerCase()) || 
        r.description.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesPriority = this.selectedPriority === 'ALL' || r.priority === this.selectedPriority;
      const matchesCategory = this.selectedCategory === 'ALL' || r.category === this.selectedCategory;
      
      let matchesStatus = true;
      if (this.selectedStatus === 'COMPLETED') {
        matchesStatus = r.completed;
      } else if (this.selectedStatus === 'PENDING') {
        matchesStatus = !r.completed;
      } else if (this.selectedStatus === 'OVERDUE') {
        matchesStatus = !r.completed && this.isOverdue(r);
      }

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'ALTA': return 'warn';
      case 'MEDIA': return 'accent';
      case 'BAIXA': return 'primary';
      default: return 'primary';
    }
  }

  openForm(reminder?: Reminder) {
    const dialogRef = this.dialog.open(ReminderFormComponent, {
      width: '500px',
      data: { reminder }
    });

    dialogRef.afterClosed().subscribe((result: ReminderRequest) => {
      if (result) {
        if (reminder && reminder.id) {
          this.reminderService.update(reminder.id, result).subscribe({
            next: () => {
              this.loadReminders();
              this.showSuccess('Lembrete atualizado!');
            },
            error: () => this.showError('Erro ao atualizar')
          });
        } else {
          this.reminderService.create(result).subscribe({
            next: () => {
              this.loadReminders();
              this.showSuccess('Lembrete criado!');
            },
            error: () => this.showError('Erro ao criar')
          });
        }
      }
    });
  }

  toggleComplete(id: number) {
    this.reminderService.toggleComplete(id).subscribe({
      next: () => this.loadReminders(),
      error: () => this.showError('Erro ao alterar status')
    });
  }

  deleteReminder(id: number) {
    if (confirm('Tem certeza que deseja excluir?')) {
      this.reminderService.delete(id).subscribe({
        next: () => {
          this.loadReminders();
          this.showSuccess('Lembrete excluído');
        },
        error: () => this.showError('Erro ao excluir')
      });
    }
  }

  // Real-time alarm monitoring
  startAlarmMonitor() {
    this.alarmInterval = setInterval(() => {
      const now = new Date().getTime();
      this.reminders.forEach(r => {
        if (r.id && !r.completed && r.dueDate) {
          const dueTime = new Date(r.dueDate).getTime();
          // Alarm triggers when the reminder is due or passed, and hasn't been alerted yet
          if (dueTime <= now && !this.alertedIds.has(r.id)) {
            const timeDiff = now - dueTime;
            // Prevent historical/old alerts from popping up on load (only alert if within 2 minutes)
            if (timeDiff < 120000) {
              this.alertedIds.add(r.id);
              this.triggerAlarm(r);
            }
          }
        }
      });
    }, 10000); // Check every 10 seconds
  }

  playAlertSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Beautiful synthesized digital chime
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      
      playTone(523.25, 0, 0.15);      // C5
      playTone(659.25, 0.12, 0.15);   // E5
      playTone(783.99, 0.24, 0.30);   // G5
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  triggerAlarm(reminder: Reminder) {
    this.playAlertSound();
    
    const snackRef = this.snackBar.open(
      `🔔 ALERTA: "${reminder.title}" está vencendo agora!`, 
      'CONCLUIR', 
      { 
        duration: 15000, 
        panelClass: ['warning-snackbar'] 
      }
    );

    snackRef.onAction().subscribe(() => {
      if (reminder.id) {
        this.toggleComplete(reminder.id);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
