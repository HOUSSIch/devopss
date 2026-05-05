import { http } from "./http";

export const setChatbotToken = (_token: string | null) => {
  // Kept for compatibility with existing callers; the shared http client
  // now injects the active auth token automatically.
};

export const chatbotService = {
  async sendMessage(message: string, conversationId?: string) {
    try {
      const response = await http.post("/chatbot/message", { message, conversationId });

      return response.data;
    } catch (error: any) {
      console.error("❌ sendMessage error:", error.response || error);
      throw error;
    }
  },

  async getConversations() {
    try {
      const response = await http.get("/chatbot/conversations");

      return response.data;
    } catch (error: any) {
      console.error("❌ getConversations error:", error.response || error);
      throw error;
    }
  },

  async getConversationById(id: string) {
    try {
      const response = await http.get(`/chatbot/conversation/${id}`);

      return response.data;
    } catch (error: any) {
      console.error("❌ getConversationById error:", error.response || error);
      throw error;
    }
  },
};