// This is a placeholder adapter for the first chat provider.
// You'll implement actual SDK/API calls here.
export class Channel1Adapter {
  async sendMessage(conversationExternalId: string, text: string) {
    // TODO: call provider API
    return { ok: true };
  }
}

