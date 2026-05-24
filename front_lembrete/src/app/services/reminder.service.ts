import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reminder, ReminderRequest } from '../models/reminder';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = `${environment.apiUrl}/reminders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(this.apiUrl);
  }

  create(reminder: ReminderRequest): Observable<Reminder> {
    return this.http.post<Reminder>(this.apiUrl, reminder);
  }

  update(id: number, reminder: ReminderRequest): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.apiUrl}/${id}`, reminder);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleComplete(id: number): Observable<Reminder> {
    return this.http.patch<Reminder>(`${this.apiUrl}/${id}/toggle-complete`, {});
  }
}
