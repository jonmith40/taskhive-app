"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useRouter } from "next/navigation";

interface UserData {
  role: "worker" | "employer";
  balance?: number;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  nidNumber?: string;
  nidStatus?: "Unverified" | "Under Review" | "Verified";
  bkashNumber?: string;
  nagadNumber?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string;
  timezone?: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (roleForNewUser: "worker" | "employer") => Promise<"worker" | "employer">;
  signInWithEmail: (email: string, password: string) => Promise<"worker" | "employer">;
  signUpWithEmail: (email: string, password: string, role: "worker" | "employer") => Promise<"worker" | "employer">;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => "worker",
  signInWithEmail: async () => "worker",
  signUpWithEmail: async () => "worker",
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeDoc: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Set up real-time listener for the user's document
        unsubscribeDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const signInWithGoogle = async (roleForNewUser: "worker" | "employer") => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    const docRef = await getDoc(doc(db, "users", user.uid));
    if (docRef.exists()) {
      const data = docRef.data() as UserData;
      setUserData(data);
      return data.role;
    } else {
      const newUserData: UserData = { role: roleForNewUser, balance: 0 };
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: roleForNewUser,
        balance: 0
      });
      setUserData(newUserData);
      return roleForNewUser;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const docRef = await getDoc(doc(db, "users", userCredential.user.uid));
    if (docRef.exists()) {
      const data = docRef.data() as UserData;
      setUserData(data);
      return data.role;
    }
    return "worker"; // Fallback
  };

  const signUpWithEmail = async (email: string, password: string, role: "worker" | "employer") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUserData: UserData = { role, balance: 0 };
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: role,
      balance: 0
    });
    setUserData(newUserData);
    return role;
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
