
export interface AiResponseItem {
  id: string;
  content: string;
  responseData: string;
}

export interface SaveAiResponseResponse {
  success: true;
  data: {
    roomId: string;
    aiTitle?: string;
    maxPrompt: number;
    promptUsed: number;
    chat: AiResponseItem[];
  };

}

