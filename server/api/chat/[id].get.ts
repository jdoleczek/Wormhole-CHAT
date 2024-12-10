
import { defineEventHandler } from 'h3';
import { ChatRoom, chatRooms } from '../../data/chatRooms';

export default defineEventHandler(async event => {
  const id = String(event.context.params?.id);

  let chat : ChatRoom | undefined = chatRooms.find(item => item.uid == id);

  if (!chat && id) {
    chat = {
      name: 'Buduar',
      created: new Date(),
      uid: id,
      public: false,
      password: '',
      participants: [],
    };

    chatRooms.push(chat);
  }

  if (chat) {
    return { chat: {
      name: chat.name,
      created: chat.created,
      uid: chat.uid,
      passwordRequired: !!chat.password,
    }};
  }

  return { chat: {} };
});
