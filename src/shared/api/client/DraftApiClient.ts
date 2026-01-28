// Draft-specific API client with typed requests and responses

import { DraftRequestData, DraftResponseData } from "@features/draft/api/protocol";
import { getRemoteUrl } from "@config/environment/Environment";
import { WebSocketApiClient } from "./WebSocketApiClient";
import { ApiClientConfig } from "./types";

export class DraftApiClient extends WebSocketApiClient<DraftRequestData, DraftResponseData> {
  private static instance: DraftApiClient | null = null;

  private constructor(config: ApiClientConfig) {
    super(config);
  }

  public static getInstance(): DraftApiClient {
    if (!DraftApiClient.instance) {
      DraftApiClient.instance = new DraftApiClient({
        url: getRemoteUrl(),
        reconnect: true,
        maxReconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
        requestTimeout: 10000,
      });
    }
    return DraftApiClient.instance;
  }

  public static resetInstance(): void {
    if (DraftApiClient.instance) {
      DraftApiClient.instance.disconnect();
      DraftApiClient.instance = null;
    }
  }

  // Draft-specific convenience methods
  public async sendDraftRequest(request: DraftRequestData): Promise<void> {
    await this.send(request);
  }

  public subscribeToDraftUpdates(
    handler: (response: DraftResponseData) => void
  ): () => void {
    return this.onMessage(handler);
  }
}
