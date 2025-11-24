import { v4 as uuidv4 } from 'uuid';

import { chatRooms, connections, ChatMessage, ChatMessageKind, ChatConnection } from '../data/chatRooms';

export function getConnection(secret: string) : ChatConnection | null {
  return connections[secret] || null;
}

export function registerBySecret(secret: string, socket: any) : ChatConnection | null {
  if (connections[secret]?.socket) {
    try {
      connections[secret].socket?.close?.();
    } catch (e) {
      console.error('problem closing stale socket', e);
    }

    delete connections[secret];
  }

  for (let i = 0; i < chatRooms.length; i++) {
    let chat = chatRooms[i];

    for (let j = 0; j < chat.participants.length; j++) {
      let participant = chat.participants[j];

      if (participant.secret === secret) {
        let connection: ChatConnection = {
          chat,
          participant,
          created: new Date(),
          socket,
        };

        connections[secret] = connection;

        updateParticipantsMsg(connection);
        return connection;
      }
    }
  }

  return null;
}

export function msg(connection: ChatConnection, message: string, kind: ChatMessageKind | string) : ChatMessage {
  let messagePack: ChatMessage = {
    uid: uuidv4(),
    created: new Date(),
    kind: kind as ChatMessageKind,
    fromUid: connection.participant.uid,
    content: message,
  };

  for (let i = 0; i < connection.chat.participants.length; i++) {
    let participant = connection.chat.participants[i];

    if (connections[participant.secret] && connections[participant.secret].socket) {
      try {
        connections[participant.secret].socket?.send(JSON.stringify(messagePack));
      } catch (error) {
        console.error('Failed to push message via websocket', error);
      }
    }
  }

  return messagePack;
}

export function systemMsg(connection: ChatConnection, message: string) : ChatMessage {
  return msg(connection, message, 'system');
}

export function updateParticipantsMsg(connection: ChatConnection) : ChatMessage {
  let message = JSON.stringify(connection.chat.participants.map(participant => ({
    nick: participant.nick,
    uid: participant.uid,
    isAdmin: participant.role === 'admin',
    isActive: !!connections[participant.secret]?.socket || false,
  })));

  return msg(connection, message, 'participants');
}

export function removeConnection(secret: string) : ChatConnection | null {
  const connection = connections[secret] || null;

  if (connection) {
    try {
      connection.socket?.close?.();
    } catch (error) {
      console.error('Failed to close websocket cleanly', error);
    }

    connection.socket = null;
    delete connections[secret];
  }

  return connection;
}
