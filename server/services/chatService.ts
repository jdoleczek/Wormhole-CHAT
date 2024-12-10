import { H3Event } from 'h3';
import { v4 as uuidv4 } from 'uuid';

import { chatRooms, connections, ChatMessage, ChatMessageKind, ChatConnection } from '../data/chatRooms';

export function getConnection(secret: string) : ChatConnection | null {
  return connections[secret] || null;
}

export function registerBySecet(secret: string, event: H3Event) : ChatConnection | null {
  if (!!getConnection(secret)) {
    return null;
  }

  for (let i = 0; i < chatRooms.length; i++) {
    let chat = chatRooms[i];

    for (let j = 0; j < chat.participants.length; j++) {
      let participant = chat.participants[j];

      if (participant.secret === secret) {
        setHeaders(event, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        let connection: ChatConnection = {
          chat,
          participant,
          created: new Date(),
          stream: event.node.res
        };

        connections[secret] = connection;

        connection.stream?.on('close', () => {
          connection.stream?.end();
          connection.stream = null;
          updateParticipantsMsg(connection);
        });

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

    if (connections[participant.secret] && connections[participant.secret].stream) {
      connections[participant.secret].stream?.write(`data: ${JSON.stringify(messagePack)}\n\n`);
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
    isActive: !!connections[participant.secret]?.stream || false,
  })));

  return msg(connection, message, 'participants');
}
