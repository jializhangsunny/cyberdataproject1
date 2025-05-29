"use client";

import React from 'react';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

const adminRoles = ['admin']; 

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={adminRoles}>
      <UserManagement />
    </ProtectedRoute>
  );
}