export type MessageModel = {
  id?: string;
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date | string;
  receiverId: string;
};
