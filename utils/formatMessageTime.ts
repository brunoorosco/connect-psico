export const formatMessageTime = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = date.toLocaleDateString();
  return isToday ? time : `${formattedDate} - ${time}`;
};
