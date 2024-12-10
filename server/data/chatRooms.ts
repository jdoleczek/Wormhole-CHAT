import { ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';

export interface ChatParticipant {
  nick: string;
  created: Date;
  uid: string,
  secret: string,
  role: 'admin' | 'normal'
}

export type ChatMessageKind = 'system' | 'participants' | 'message' | 'file' | 'audio';

export interface ChatMessage {
  uid: string,
  created: Date,
  kind: ChatMessageKind,
  fromUid: string | null | undefined,
  content: string,
}

export interface ChatRoom {
  name: string;
  created: Date;
  uid: string,
  public: boolean,
  password: string,
  participants: ChatParticipant[],
}

export interface ChatConnection {
  chat: ChatRoom,
  participant: ChatParticipant,
  created: Date,
  stream: ServerResponse | null,
}

export const chatRooms: ChatRoom[] = [
  {
    name: 'Powszechny',
    created: new Date(),
    uid: uuidv4(),
    public: true,
    password: '',
    participants: [],
  },
];

export const connections: Record<string, ChatConnection> = {};
