
import { defineEventHandler } from 'h3';
import { chatRooms } from '../data/chatRooms';

export default defineEventHandler(() => {
  const chats = chatRooms
    .filter(item => item.public)
    .map(item => ({
      name: item.name,
      created: item.created,
      uid: item.uid,
      passwordRequired: !!item.password,
    }));

  return { chats };
});
