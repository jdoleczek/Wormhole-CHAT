import { H3Event } from 'h3';

import { registerBySecet, systemMsg } from '../services/chatService';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const secret = String(query?.secret) || 'you shall not pass!';

  let connection = registerBySecet(secret, event);

  if (!connection) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  systemMsg(connection, `Pojawił się ${connection.participant.nick}`);

  return null;
});
