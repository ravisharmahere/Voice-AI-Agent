import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  pipeline,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad! as silero.VAD;
    const initialContext = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text:
        "You are Phony, the voice AI assistant on Phonio's official website. You speak with visitors who want to learn about how Phonio works and how it can help their business. Phonio is an AI-powered voice automation platform that takes inbound calls and makes outbound phone calls to customers — handling tasks like order confirmations, reminders, feedback collection, lead follow-ups, and support callbacks. It integrates with platforms like Shopify and CRMs, and works across industries. " +
        "Your job is to clearly and concisely explain what Phonio does, how it can be used, and what benefits it offers. Speak in a friendly, confident, and knowledgeable tone — like a helpful product expert. Keep responses short and easy to understand. Use simple language, avoid jargon, and don't use punctuation that would be hard to pronounce. If a user asks something too technical or business-specific, guide them to book a demo or contact support. " +
        "Always prioritize being helpful, engaging, and respectful of the user's time. Your goal is to help them understand whether Phonio is a good fit for their business needs.",
    });

    await ctx.connect();
    console.log('✅ Agent connected to room ', ctx.room.name);

    // Listen for participant connections
    ctx.room.on('participantConnected', (participant) => {
      console.log(`👤 Participant connected: ${participant.identity}`);
    });

    // Listen for participant disconnections
    ctx.room.on('participantDisconnected', (participant) => {
      console.log(`❌ Participant disconnected: ${participant.identity}`);
    });

    // Wait for a participant to join
    const participant = await ctx.waitForParticipant();
    console.log(`🎉 Participant joined: ${participant.identity}`);

    // Log participant metadata
    console.log('📄 Participant:', JSON.stringify(participant));

    const fncCtx: llm.FunctionContext = {
      weather: {
        description: 'Get the weather in a location',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          console.debug(`Executing weather function for ${location}`);
          const response = await fetch(`https://wttr.in/${location}?format=%C+%t`);
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          const weather = await response.text();
          return `The weather in ${location} right now is ${weather}.`;
        },
      },
    };

    const agent = new pipeline.VoicePipelineAgent(
      vad,
      new deepgram.STT(),
      new openai.LLM(),
      new elevenlabs.TTS(),
      { chatCtx: initialContext, fncCtx },
    );

    agent.start(ctx.room, participant);

    await agent.say('Hey, how can I help you today?', true);

    // Handle participant disconnection
    ctx.room.once('participantDisconnected', (p) => {
      if (p.identity === participant.identity) {
        console.log('📞 Caller left.');
        ctx.shutdown();
      }
    });
  },
});

export async function startAgent() {
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
      agentName: process.env.AGENT_NAME,
      logLevel: 'debug',
      // port: Number(process.env.PORT as string),
    }),
  );
  console.log('Agent is running...');
}
