import dotenv from 'dotenv';
import { SipClient, SipDispatchRuleIndividual } from 'livekit-server-sdk';

dotenv.config();

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
} = process.env;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  throw new Error('Missing required environment variables: LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET.');
}

export async function createSipDispatchRule(): Promise<void> {
  const sipClient = new SipClient(LIVEKIT_URL as string, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

  const dispatchRule: SipDispatchRuleIndividual = {
    type: 'individual',
    roomPrefix: 'call-',
  };

  try {
    // List existing dispatch rules
    const existingRules = await sipClient.listSipDispatchRule();
    console.log('Existing SIP Dispatch Rules:', JSON.stringify(existingRules));

    // Check if a rule with the same roomPrefix exists
    const ruleExists = existingRules.some(rule =>{
      console.log('Checking rule:', (rule.rule?.rule.value as any).roomPrefix);
      return (rule.rule?.rule.value as any).roomPrefix === dispatchRule.roomPrefix
    }
    );

    console.log(`Rule with roomPrefix "${dispatchRule.roomPrefix}" already exists: ${ruleExists}`);

    if (ruleExists) {
      console.log('✅ SIP Dispatch Rule already exists. Skipping creation.');
      return;
    }

    const response = await sipClient.createSipDispatchRule(dispatchRule);
    console.log('✅ SIP Dispatch Rule created successfully:', response);
  } catch (error) {
    console.error('❌ Failed to create SIP Dispatch Rule:', error);
  }
}
