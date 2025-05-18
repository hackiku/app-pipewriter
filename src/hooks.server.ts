// src/hooks.server.ts
import { adminAuth, adminFirestore } from "$lib/server/firebase-admin";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

// Trial duration in days
const TRIAL_PERIOD_DAYS = 10;

// Authentication handler
const auth: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get("__session");
  
  // Default state - unauthenticated
  event.locals.user = null;
  event.locals.isPremium = false;
  event.locals.trialActive = false;
  event.locals.trialDaysLeft = 0;
  event.locals.features = getDefaultFeatures();
  
  if (sessionCookie) {
    try {
      // Verify the session cookie
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      const uid = decodedClaims.uid;

      // Get user data from Auth service
      const userRecord = await adminAuth.getUser(uid);

      // Get user data from Firestore (for premium status, trial info)
      const userDoc = await adminFirestore.collection('users').doc(uid).get();
      const userData = userDoc.data() || {};

      // Set user information in locals
      event.locals.user = {
        uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      };

      // Check premium status
      event.locals.isPremium = userData.premium === true;

      // If not premium, check trial status
      if (!event.locals.isPremium) {
        const trialInfo = await checkTrialStatus(uid, userData);
        event.locals.trialActive = trialInfo.active;
        event.locals.trialDaysLeft = trialInfo.daysLeft;
      }

      // Get available features based on status
      event.locals.features = getFeatureFlags(
        event.locals.isPremium, 
        event.locals.trialActive
      );
    } catch (error) {
      console.error('Session verification failed:', error);
      // Clear the invalid cookie
      event.cookies.delete('__session', { path: '/' });
    }
  }
  
  return resolve(event);
};

// Route protection rules
const routeGuards: Handle = async ({ event, resolve }) => {
  // Protect addon route
  if (event.url.pathname === '/addon') {
    if (!event.locals.user) {
      throw redirect(303, '/?auth=required');
    }
  }
  
  return resolve(event);
};

// Helper functions
function getDefaultFeatures() {
  return {
    allowedElements: ['basic'],
    allowAiFeatures: false,
    allowColorCustomization: false,
    allowStyleGuide: false
  };
}

function getFeatureFlags(isPremium, trialActive) {
  if (isPremium) {
    return {
      allowedElements: ['basic', 'premium', 'pro'],
      allowAiFeatures: true,
      allowColorCustomization: true,
      allowStyleGuide: true
    };
  }

  if (trialActive) {
    return {
      allowedElements: ['basic', 'premium'],
      allowAiFeatures: true,
      allowColorCustomization: true,
      allowStyleGuide: true
    };
  }

  return getDefaultFeatures();
}

// Check user's trial status
async function checkTrialStatus(uid, userData) {
  // If no trial start date exists, create one
  if (!userData.trialStartDate) {
    const trialStartDate = new Date();
    await adminFirestore.collection('users').doc(uid).set({
      trialStartDate
    }, { merge: true });

    return {
      active: true,
      daysLeft: TRIAL_PERIOD_DAYS
    };
  }

  // Calculate days left in trial
  const trialStartDate = userData.trialStartDate.toDate();
  const currentDate = new Date();
  const diffTime = currentDate.getTime() - trialStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_PERIOD_DAYS - diffDays);

  return {
    active: daysLeft > 0,
    daysLeft
  };
}

// Combine handlers in sequence
export const handle = sequence(auth, routeGuards);