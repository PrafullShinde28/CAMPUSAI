import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.coursework.me.readonly');

export function signInWithGoogle() {
  signInWithRedirect(auth, provider);
}

export async function handleAuthRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      // Store Google access token for Classroom API
      if (accessToken) {
        localStorage.setItem('googleAccessToken', accessToken);
      }
      
      // Verify with backend
      const idToken = await result.user.getIdToken();
      const response = await apiRequest('POST', '/api/auth/verify', { idToken });
      const { user } = await response.json();
      
      // Set flag to show auth success modal
      localStorage.setItem('justSignedIn', 'true');
      
      return { user, accessToken };
    }
    return null;
  } catch (error) {
    console.error('Auth redirect error:', error);
    throw error;
  }
}

export async function signOutUser() {
  await signOut(auth);
  localStorage.removeItem('googleAccessToken');
}

export async function getCurrentUserToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}
