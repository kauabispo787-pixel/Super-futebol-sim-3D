
import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiService {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private isOffline(): boolean {
    return !navigator.onLine;
  }

  async getNarration(eventDescription: string): Promise<string> {
    if (this.isOffline()) return "Que beleza de jogada!";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o narrador de futebol Dandan Pereira da SporTV. 
        Instrução: Narre o seguinte evento de forma MUITO animada e curta: "${eventDescription}".
        Use obrigatoriamente um destes bordões: "Chegou o momento!", "Tá lá dentro!", "É rede!", "Que beleza!", "Olha o que ele fez!", "Esculachou!", "E o que é que eu vou dizer lá em casa?", "Tá em casa!", "É do Brasil!".
        Seja épico e vibrante.`,
      });
      return response.text || "Tá lá dentro!";
    } catch (e) {
      return "Gooool! Que beleza de jogada!";
    }
  }

  /**
   * Gera mensagens de chat para o lobby online.
   */
  async getOnlineChatMessages(): Promise<{user: string, message: string}[]> {
    if (this.isOffline()) {
      return [
        {user: "Offline_Player", message: "Você está jogando em modo local."},
        {user: "SoccerBot", message: "Conecte-se para ver o chat da comunidade."}
      ];
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere 5 mensagens curtas de um chat de jogo de futebol online. 
        Nomes de usuários devem ser brasileiros ou handles de gamers (ex: GolsFera, PvPMaster2026, Coringão_Mil_Grau).
        O tom deve ser competitivo, amigável ou de reclamação sobre o "lag" ou táticas.
        Retorne em formato JSON: Array<{user: string, message: string}>.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [
        {user: "Dandan_Fan", message: "Alguém pra amistoso? Meu Santos tá voando!"},
        {user: "PvP_Master", message: "Aquele chute de chapa tá OP demais nesse patch."},
        {user: "GamerBR", message: "Rumo ao rank Mestre!"}
      ];
    }
  }

  async speak(text: string): Promise<void> {
    if (!text || !process.env.API_KEY || this.isOffline()) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, 
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await this.playAudio(base64Audio);
      }
    } catch (e: any) {
      console.warn("TTS offline");
    }
  }

  private async playAudio(base64: string): Promise<void> {
    try {
      const ctx = this.getAudioContext();
      const bytes = this.decode(base64);
      const buffer = await this.decodeAudioData(bytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error(e);
    }
  }

  private decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const geminiService = new GeminiService();
