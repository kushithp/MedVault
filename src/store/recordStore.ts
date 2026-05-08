import { create } from 'zustand';

interface Record {
  id: string;
  title: string;
  category: string;
  date: string;
  summary?: string;
  fileUrl?: string;
}

interface RecordState {
  records: Record[];
  addRecord: (record: Record) => void;
  setRecords: (records: Record[]) => void;
}

export const useRecordStore = create<RecordState>((set) => ({
  records: [],
  addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
  setRecords: (records) => set({ records }),
}));
