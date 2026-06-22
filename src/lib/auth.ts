// 会员端登录态：zustand + persist 持久化到 localStorage

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from './types';

interface AuthState {
  member: Member | null;
  token: string | null;
  login: (member: Member, token: string) => void;
  logout: () => void;
  updateMember: (partial: Partial<Member>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      member: null,
      token: null,
      login: (member, token) => set({ member, token }),
      logout: () => set({ member: null, token: null }),
      updateMember: (partial) =>
        set((state) =>
          state.member ? { member: { ...state.member, ...partial } } : state,
        ),
    }),
    { name: 'jingzhi-member-auth' },
  ),
);
