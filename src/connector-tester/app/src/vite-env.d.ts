/// <reference types="svelte" />
/// <reference types="vite/client" />

interface WindowData {
  tenantId: string;
  tenantName: string;
  tenantDisplayName: string;
}

declare global {
  interface Window {
    data: WindowData;
  }
}
