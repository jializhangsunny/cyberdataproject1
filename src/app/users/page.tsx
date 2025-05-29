// app/users/page.js
"use client";

import React from 'react';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <UserManagement />
    </ProtectedRoute>
  );
}