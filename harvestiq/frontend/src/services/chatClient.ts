/**
 * Chat client service for HarvestIQ AI assistant
 * This is a stub implementation that can be replaced with real LLM integration
 */

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
}

export class ChatClient {
  private messages: ChatMessage[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];

  constructor() {
    // Load messages from localStorage
    const stored = localStorage.getItem('harvestiq_chat_messages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.messages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    }
  }

  private saveMessages() {
    localStorage.setItem('harvestiq_chat_messages', JSON.stringify(this.messages));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.messages]));
  }

  addListener(listener: (messages: ChatMessage[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current messages
    listener([...this.messages]);
  }

  removeListener(listener: (messages: ChatMessage[]) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  async sendMessage(message: string): Promise<void> {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      isUser: true,
    };
    
    this.messages.push(userMessage);
    this.saveMessages();
    this.notifyListeners();

    try {
      // Call the backend chat API (mock for now)
      const response = await fetch('http://localhost:8000/predictions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: data.response,
          timestamp: new Date(data.timestamp),
          isUser: false,
        };
        
        this.messages.push(aiMessage);
      } else {
        // Fallback to local mock response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: this.getMockResponse(message),
          timestamp: new Date(),
          isUser: false,
        };
        
        this.messages.push(aiMessage);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback to local mock response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: this.getMockResponse(message),
        timestamp: new Date(),
        isUser: false,
      };
      
      this.messages.push(aiMessage);
    }

    this.saveMessages();
    this.notifyListeners();
  }

  private getMockResponse(message: string): string {
    const responses = [
      "I'm here to help with your farming insights! What would you like to know?",
      "Based on your recent data, your crops are showing good growth patterns.",
      "Have you considered checking the soil moisture levels in your fields?",
      "The weather forecast looks favorable for the next few days.",
      "Your yield predictions are looking promising this season!",
    ];

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('weather')) {
      return "The weather forecast shows optimal growing conditions with moderate rainfall expected.";
    } else if (lowerMessage.includes('yield') || lowerMessage.includes('harvest')) {
      return "Your current yield predictions indicate a 15-20% increase compared to last season.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('market')) {
      return "Market prices are trending upward. Consider timing your harvest for maximum profit.";
    } else if (lowerMessage.includes('soil')) {
      return "Soil analysis shows good nutrient levels. Consider adding organic matter for better retention.";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
    this.saveMessages();
    this.notifyListeners();
  }
}

// Export singleton instance
export const chatClient = new ChatClient();