// 会员端登录态：zustand + persist 持久化到 localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from './types';

interface AuthState {
  member: Member | null;
  token: string | null;
  login: (member: Member, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      member: null,
      token: null,
      login: (member, token) => set({ member, token }),
      logout: () => set({ member: null, token: null }),
    }),
    { name: 'jingzhi-member-auth' },
  ),
);
