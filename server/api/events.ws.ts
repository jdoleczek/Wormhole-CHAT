import { defineWebSocketHandler } from 'h3';

import { registerBySecret, removeConnection, systemMsg, updateParticipantsMsg } from '../services/chatService';

function extractSecret(peer: any): string {
  const url = peer?.websocket?.url || peer?.request?.url || '';

  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.searchParams.get('secret') || '';
  } catch (error) {
    console.error('Nie udało się odczytać sekretu z adresu URL', error);
    return '';
  }
}

export default defineWebSocketHandler({
  open(peer) {
    const secret = extractSecret(peer);

    if (!secret) {
      peer.close(4401, 'Unauthorized');
      return;
    }

    const connection = registerBySecret(secret, peer);

    if (!connection) {
      peer.close(4401, 'Unauthorized');
      return;
    }

    (peer as any)._chatSecret = secret;
    systemMsg(connection, `Pojawił się ${connection.participant.nick}`);
  },

  close(peer) {
    const secret = (peer as any)._chatSecret || extractSecret(peer);
    const connection = removeConnection(secret);

    if (connection) {
      updateParticipantsMsg(connection);
    }
  },

  error(peer, error) {
    console.error('WebSocket error', error);
    peer.close(1011, 'Unexpected error');
  },
});
