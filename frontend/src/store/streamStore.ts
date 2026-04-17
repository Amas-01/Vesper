// Zustand store for stream state
// TODO: Implement stream store with cache management

import { create } from 'zustand'
import { Stream } from '../types/stream'

interface StreamStore {
  streams: Stream[]
  setStreams: (streams: Stream[]) => void
  addStream: (stream: Stream) => void
  updateStream: (id: bigint, updates: Partial<Stream>) => void
  removeStream: (id: bigint) => void
}

export const useStreamStore = create<StreamStore>((set) => ({
  streams: [],
  setStreams: (streams) => set({ streams }),
  addStream: (stream) => set((state) => ({ streams: [...state.streams, stream] })),
  updateStream: (id, updates) => set((state) => ({
    streams: state.streams.map((s) => s.id === id ? { ...s, ...updates } : s),
  })),
  removeStream: (id) => set((state) => ({
    streams: state.streams.filter((s) => s.id !== id),
  })),
}))
