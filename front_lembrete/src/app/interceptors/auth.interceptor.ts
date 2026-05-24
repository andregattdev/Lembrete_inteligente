import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;

  if (currentUser && currentUser.id) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-User-Id': currentUser.id.toString()
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
