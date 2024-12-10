import { v4 as uuidv4 } from 'uuid';

import { chatRooms, ChatParticipant, ChatRoom } from '../data/chatRooms';

function getRandomNick(): string {
  const nicknames = [
    'Sokrates',         // Starożytna Grecja
    'Platon',           // Starożytna Grecja
    'Plotyn',           // Starożytna Grecja
    'Arystoteles',      // Starożytna Grecja
    'Heraklit',         // Starożytna Grecja
    'Parmenides',       // Starożytna Grecja
    'Pitagoras',        // Starożytna Grecja
    'Epikur',           // Starożytna Grecja
    'Zeno z Elei',      // Starożytna Grecja
    'Diogenes z Synopy',// Starożytna Grecja
    'Protagoras',       // Starożytna Grecja
    'Tales z Miletu',   // Starożytna Grecja
    'Anaksymander',     // Starożytna Grecja
    'Anaksymenes',      // Starożytna Grecja
    'Konfucjusz',       // Starożytne Chiny
    'Laozi',            // Starożytne Chiny
    'Tomasz z Akwinu',  // Średniowiecze
    'Św. Augustyn',     // Średniowiecze
    'Kartezjusz',       // Filozofia nowożytna
    'Immanuel Kant',    // Filozofia nowożytna
    'Fryderyk Nietzsche',// XIX wiek
    'Georg Wilhelm Friedrich Hegel', // Filozofia nowożytna
    'David Hume',       // Oświecenie
    'John Locke',       // Oświecenie
    'Jean-Jacques Rousseau', // Oświecenie
    'Ludwig Wittgenstein', // XX wiek
    'Bertrand Russell', // XX wiek
  ];

  return nicknames[~~(Math.random() * nicknames.length)];
}

export default defineEventHandler(async event => {
  const body = await readBody(event);

  if (
    typeof body.chatUid !== 'string' ||
    typeof body.nick !== 'string' ||
    (body.password && typeof body.password !== 'string')
  ) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowe dane wejściowe',
    });
  }

  let chat: ChatRoom | undefined = chatRooms.find(chat => chat.uid == body.chatUid);

  if (!chat) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    throw createError({
      statusCode: 404,
      message: 'Nie odnaleziono pokoju',
    });
  } else if (chat.password && chat.password != body.password) {
    throw createError({
      statusCode: 401,
      message: 'Brak uprawnień',
    });
  }

  let participant: ChatParticipant = {
    nick: body.nick || getRandomNick(),
    created: new Date(),
    uid: uuidv4(),
    secret: uuidv4(),
    role: chat.participants.length ? 'normal' : 'admin',
  };

  chat.participants.push(participant);

  return {
    message: 'assigned',
    nick: participant.nick,
    uid: participant.uid,
    secret: participant.secret,
    role: participant.role,
  };
});
