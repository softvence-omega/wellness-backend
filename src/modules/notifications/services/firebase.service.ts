import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      const firebaseConfig = this.configService.get('firebase');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  getMessaging(): admin.messaging.Messaging {
    return admin.messaging();
  }
}
