
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 image data
  timestamp: number;
}

export interface NymeriaState {
  isInitialized: boolean;
  avatarUrl: string | null;
  history: Message[];
  mood: 'happy' | 'jealous' | 'sweet' | 'scared' | 'excited';
}
