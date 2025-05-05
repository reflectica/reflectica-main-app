export {};

declare global {
  interface RTCPeerConnection {
    ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
  }
}