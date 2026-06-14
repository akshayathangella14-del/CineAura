// CineAura UI Store
// Manages: sidebar, modals, global loading, UI state
import { create } from 'zustand'

const useUiStore = create((set) => ({
  // State
  isSidebarOpen: false,
  isModalOpen: false,
  isAuthModalOpen: false,
  modalContent: null,
  globalLoading: false,

  // Actions
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isSidebarOpen) =>
    set({ isSidebarOpen }),

  openModal: (content) =>
    set({ isModalOpen: true, modalContent: content }),

  closeModal: () =>
    set({ isModalOpen: false, modalContent: null }),

  openAuthModal: () =>
    set({ isAuthModalOpen: true }),

  closeAuthModal: () =>
    set({ isAuthModalOpen: false }),

  setGlobalLoading: (globalLoading) =>
    set({ globalLoading }),
}))

export default useUiStore
