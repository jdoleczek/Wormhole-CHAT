import { v4 as uuidv4 } from "uuid";

import { chatRooms } from '../data/chatRooms';

export default defineEventHandler(async event => {
  const body = await readBody(event);

  if (
    typeof body.name !== "string" ||
    typeof body.private !== "boolean" ||
    typeof body.password !== "string"
  ) {
    throw createError({
      statusCode: 400,
      message: "Nieprawidłowe dane wejściowe",
    });
  }

  const newChat = {
    name: body.name,
    created: new Date(),
    uid: uuidv4(),
    public: !body.private,
    password: body.password,
    participants: [],
  };

  chatRooms.push(newChat);

  return {
    message: "created",
    chat: newChat,
  };
});
