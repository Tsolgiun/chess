/// <reference types="vite/client" />

declare module 'socket.io-client' {
  import { Socket as OriginalSocket, io as OriginalIO } from 'socket.io-client';
  export const io: typeof OriginalIO;
  export type Socket<ListenEvents = any, EmitEvents = any> = OriginalSocket<ListenEvents, EmitEvents>;
}
