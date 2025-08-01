// context/authContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userService from '../services/users';

interface User {
 id: string;
 email: string;
 type: string;
 name: string;
 organization?: {
    name: string;
    location: string;
    sector: string;
    id: string;
 }
}

interface LoginCredentials {
 email: string;
 password: string;
}

interface LoginResponse {
 user: User;
 token?: string;
}

interface AuthContextType {
 user: User | null;
 login: (credentials: LoginCredentials) => Promise<LoginResponse>;
 logout: () => void;
 isAuthenticated: () => boolean;
 hasRole: (requiredRoles: string[] | string) => boolean;
 loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
 const context = useContext(AuthContext);
 if (!context) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};

interface AuthProviderProps {
 children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState<boolean>(true);

 useEffect(() => {
   const currentUser = userService.getCurrentUser() as User | null;
   if (currentUser) {
     setUser(currentUser);
   }
   setLoading(false);
 }, []);

 const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
   try {
     const response = await userService.login(credentials);
     setUser(response.user);
     return response;
   } catch (error) {
     throw error;
   }
 };

 const logout = (): void => {
   userService.logout();
   setUser(null);
   window.location.href = '/cyberdataproject1/';
 };

 const isAuthenticated = (): boolean => {
   return !!user;
 };

 const hasRole = (requiredRoles: string[] | string): boolean => {
   if (!user) return false;
   if (Array.isArray(requiredRoles)) {
     return requiredRoles.includes(user.type);
   }
   return user.type === requiredRoles;
 };

 const value: AuthContextType = {
   user,
   login,
   logout,
   isAuthenticated,
   hasRole,
   loading
 };

 return (
   <AuthContext.Provider value={value}>
     {children}
   </AuthContext.Provider>
 );
};