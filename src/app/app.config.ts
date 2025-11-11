import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore, enableIndexedDbPersistence } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment.development';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const firestore = getFirestore();

      // Enable offline persistence to reduce network reads
      // Uses single-tab persistence (smaller bundle than multi-tab)
      // Only in browser environment (not during SSR) and production
      if (typeof window !== 'undefined' && !environment.useMockData) {
        enableIndexedDbPersistence(firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            // Persistence can only be enabled in one tab at a time
            console.warn('Firestore persistence failed: Another tab already has it enabled');
          } else if (err.code === 'unimplemented') {
            // The current browser doesn't support persistence
            console.warn('Firestore persistence not supported in this browser');
          }
        });
      }

      return firestore;
    })
  ]
};
