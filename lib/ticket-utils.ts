import { nanoid } from 'nanoid';

export function generateTicketCode(): string {
  return `GL-${nanoid(8).toUpperCase()}`;
}
