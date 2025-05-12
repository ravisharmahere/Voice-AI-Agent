import dotenv from 'dotenv';
import { AgentDispatchClient, SipClient, CreateSipParticipantOptions } from 'livekit-server-sdk';
import randomstring from 'randomstring';

dotenv.config();

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  SIP_TRUNK_ID,
  AGENT_NAME,
} = process.env;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !SIP_TRUNK_ID || !AGENT_NAME) {
  throw new Error('Missing required environment variables.');
}

/**
 * Dispatches an agent to the specified room with provided metadata.
 * @param roomName - The name of the room to dispatch the agent to.
 * @param metadata - Metadata to associate with the dispatch.
 */
async function dispatchAgent(roomName: string, metadata: string): Promise<void> {
  const dispatchClient = new AgentDispatchClient(
    LIVEKIT_URL!,
    LIVEKIT_API_KEY!,
    LIVEKIT_API_SECRET!
  );

  try {
    await dispatchClient.createDispatch(roomName, AGENT_NAME!, { metadata });
    console.log(`✅ Agent "${AGENT_NAME}" dispatched to room "${roomName}" with metadata: ${metadata}`);
  } catch (error) {
    console.error('❌ Failed to dispatch agent:', error);
    throw error;
  }
}

/**
 * Creates a SIP participant to initiate an outbound call.
 * @param phoneNumber - The phone number to call.
 * @param roomName - The name of the room to associate the call with.
 */
async function createSipParticipant(phoneNumber: string, roomName: string): Promise<void> {
  const sipClient = new SipClient(
    LIVEKIT_URL!,
    LIVEKIT_API_KEY!,
    LIVEKIT_API_SECRET!
  );

  const participantDetails: CreateSipParticipantOptions = {
    participantIdentity: phoneNumber,
    participantName: 'Outbound Caller',
    krispEnabled: true,
  };

  try {
    await sipClient.createSipParticipant(
      SIP_TRUNK_ID!,
      phoneNumber,
      roomName,
      participantDetails
    );
    console.log(`📞 Outbound call initiated to ${phoneNumber} in room "${roomName}"`);
  } catch (error) {
    console.error('❌ Failed to create SIP participant:', error);
    throw error;
  }
}

/**
 * Initiates an outbound call by dispatching an agent and creating a SIP participant.
 * @param phoneNumber - The phone number to call.
 * @returns The name of the room where the call was initiated.
 */
export async function makeOutboundCall(phoneNumber: string): Promise<string> {
  const roomName = `call-${randomstring.generate(8)}`;
  const metadata = JSON.stringify({ phone_number: phoneNumber });

  await dispatchAgent(roomName, metadata);
  await createSipParticipant(phoneNumber, roomName);

  return roomName;
}
