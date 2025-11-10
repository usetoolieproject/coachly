import { create } from 'zustand';
import type { Post } from '../types';

interface ModalState {
  isOpen: boolean;
  selectedPost: Post | null;
  openModal: (post: Post) => void;
  closeModal: () => void;
  updateSelectedPost: (post: Post) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  selectedPost: null,
  openModal: (post: Post) => set({ isOpen: true, selectedPost: post }),
  closeModal: () => set({ isOpen: false, selectedPost: null }),
  updateSelectedPost: (post: Post) => set({ selectedPost: post }),
}));
