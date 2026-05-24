import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Reminder, ReminderRequest } from '../../models/reminder';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.reminder ? 'Editar Lembrete' : 'Novo Lembrete' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="reminder-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data e Hora de Vencimento</mat-label>
          <input matInput type="datetime-local" formControlName="dueDate" required>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Prioridade</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="BAIXA">Baixa</mat-option>
              <mat-option value="MEDIA">Média</mat-option>
              <mat-option value="ALTA">Alta</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Categoria</mat-label>
            <mat-select formControlName="selectedCategory" (selectionChange)="onCategorySelectChange($event.value)">
              <mat-option *ngFor="let cat of defaultCategories" [value]="cat">{{ cat }}</mat-option>
              <mat-option value="Outro...">Outro...</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field *ngIf="showCustomCategoryInput" appearance="outline" class="full-width">
          <mat-label>Nome da Categoria Personalizada</mat-label>
          <input matInput formControlName="customCategory" placeholder="Ex: Exercícios" required>
        </mat-form-field>

        <mat-checkbox formControlName="recurring">Recorrente</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSave()">Salvar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .reminder-form {
      display: flex;
      flex-direction: column;
      margin-top: 10px;
    }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
  `]
})
export class ReminderFormComponent {
  private fb = inject(FormBuilder);

  form: any;
  defaultCategories = ['Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Finanças', 'Geral'];
  showCustomCategoryInput = false;

  constructor(
    public dialogRef: MatDialogRef<ReminderFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reminder?: Reminder }
  ) {
    const initialCategory = this.data?.reminder?.category || 'Geral';
    const isCustomCat = !!(this.data?.reminder && !this.defaultCategories.includes(initialCategory));
    this.showCustomCategoryInput = isCustomCat;

    this.form = this.fb.group({
      title: [this.data?.reminder?.title || '', Validators.required],
      description: [this.data?.reminder?.description || ''],
      dueDate: [this.data?.reminder?.dueDate ? this.formatDate(this.data.reminder.dueDate) : '', Validators.required],
      priority: [this.data?.reminder?.priority || 'MEDIA', Validators.required],
      selectedCategory: [isCustomCat ? 'Outro...' : initialCategory, Validators.required],
      customCategory: [isCustomCat ? initialCategory : ''],
      recurring: [this.data?.reminder?.recurring || false]
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onCategorySelectChange(val: string) {
    this.showCustomCategoryInput = (val === 'Outro...');
    if (!this.showCustomCategoryInput) {
      this.form.get('customCategory').setValue('');
    } else {
      this.form.get('customCategory').setValidators([Validators.required]);
      this.form.get('customCategory').updateValueAndValidity();
    }
  }

  onSave() {
    if (this.form.valid) {
      const val = { ...this.form.value };
      const category = val.selectedCategory === 'Outro...' ? val.customCategory : val.selectedCategory;
      const result = {
        title: val.title,
        description: val.description,
        dueDate: val.dueDate,
        priority: val.priority,
        category: category || 'Geral',
        recurring: val.recurring
      };
      this.dialogRef.close(result);
    }
  }
}
