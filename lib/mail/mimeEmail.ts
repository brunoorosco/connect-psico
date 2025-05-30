import juice from "juice";

export function createMimeEmail(to: string, subject: string, htmlBody: string, from: string) {
  const inlinedHtml = juice(htmlBody);

  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    inlinedHtml,
  ];

  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encodedMessage;
}
