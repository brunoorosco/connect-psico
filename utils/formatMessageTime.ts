export const formatMessageTime = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = date.toLocaleDateString();
  return isToday ? time : `${formattedDate} - ${time}`;
};

export const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;