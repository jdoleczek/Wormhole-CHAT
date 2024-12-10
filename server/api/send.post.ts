import { getConnection, msg } from '../services/chatService';

export default defineEventHandler(async event => {
  const body = await readBody(event);
  const secret = String(body?.secret);
  const message = String(body?.message);
  const kind = String(body?.kind);

  const connection = getConnection(secret);

  if (!connection) {
    throw createError({
      statusCode: 404,
      message: 'Połaczenie nieaktywne',
    });
  }

  if (!message) {
    throw createError({
      statusCode: 400,
      message: 'Brak wiadomości',
    });
  }

  if (!['message', 'file', 'audio'].includes(kind)) {
    throw createError({
      statusCode: 400,
      message: 'Niepoprawny rodzaj wiadomości',
    });
  }

  return msg(connection, message, kind);
});
