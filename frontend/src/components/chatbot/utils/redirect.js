export const addSuccessAndRedirect = ({ addMessage, messageText, date, delayMs = 2500 }) => {
  if (!addMessage || !messageText || !date) {
    return;
  }

  addMessage(messageText);

  const redirectMsg = `Redirecting to appointments page for ${date}...`;
  addMessage(redirectMsg);

  setTimeout(() => {
    window.location.href = `/appointments?date=${date}`;
  }, delayMs);
};
