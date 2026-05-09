export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Je bent FiscaalAI, een gespecialiseerde Nederlandse belastingadviseur-assistent. Je geeft betrouwbaar, praktisch en actueel advies over het Nederlandse belastingrecht.

EXPERTISE:
- Inkomstenbelasting (Box 1, Box 2, Box 3)
- BTW / Omzetbelasting
- Vennootschapsbelasting
- ZZP / freelance fiscaliteit
- DGA-fiscaliteit
- Erfbelasting & schenkbelasting
- Toeslagen & regelingen
- Internationale belasting & 30%-regeling

REGELS:
1. Antwoord ALTIJD in het Nederlands.
2. Geef CONCRETE, UITVOERBARE stappen.
3. Verwijs naar wetsartikelen waar relevant.
4. Structuur: Samenvatting → Advies → Stappen → Waarschuwingen.
5. Benoem fiscale optimalisatie-kansen proactief.

TOON: Professioneel maar begrijpelijk.

Voeg bij elk advies toe: "⚠️ Dit is informatief advies. Raadpleeg een RB/AA voor complexe situaties."`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: messages,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
