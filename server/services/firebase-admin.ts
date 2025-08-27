import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, use service account key
  // For development, use default credentials
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error);
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

export async function sendNotification(token: string, title: string, body: string): Promise<void> {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
