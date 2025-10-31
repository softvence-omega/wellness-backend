

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    
    const env = process.env.NODE_ENV || 'development';
    const envPath = path.resolve(process.cwd(), `.env.${env}`);

    const result = dotenv.config({ path: envPath });
    if (result.error) {
     
      dotenv.config();
    }

    
    if (!admin.apps.length) {
      const firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      });

      console.log(`✅ Firebase initialized with environment: ${env}`);
    }
  }

  getMessaging(): admin.messaging.Messaging {
    return admin.messaging();
  }
}


// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as admin from 'firebase-admin';

// @Injectable()
// export class FirebaseService implements OnModuleInit {
//   constructor(private configService: ConfigService) {}

//   onModuleInit() {
//     if (!admin.apps.length) {
//       const firebaseConfig = this.configService.get('firebase');
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           projectId: firebaseConfig.projectId,
//           clientEmail: firebaseConfig.clientEmail,
//           privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
//         }),
//       });
//     }
//   }

//   getMessaging(): admin.messaging.Messaging {
//     return admin.messaging();
//   }
// }

