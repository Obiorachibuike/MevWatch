
import {NextRequest, NextResponse} from 'next/server';
import {
  detectSandwichAttack,
  DetectSandwichAttackInput,
} from '@/ai/flows/detect-sandwich-attack';
import {
  analyzeTransactionTime,
  AnalyzeTransactionTimeInput,
} from '@/ai/flows/analyze-transaction-time';
import {z} from 'zod';

const sandwichSchema = z.object({
  type: z.literal('sandwich'),
  transactionOrdering: z.string().min(1, 'Transaction ordering is required.'),
  gasPremiums: z.string().min(1, 'Gas premiums are required.'),
  slippage: z.string().min(1, 'Slippage is required.'),
});

const timeAnalyzerSchema = z.object({
  type: z.literal('time'),
  victimTransactionTime: z.coerce
    .number()
    .min(1, 'Victim transaction time is required.'),
  botTransactionTimes: z
    .string()
    .min(1, 'Bot transaction times are required.'),
  botTransactionAddresses: z
    .string()
    .min(1, 'Bot transaction addresses are required.'),
  blockTimeThreshold: z.coerce.number().optional().default(12),
}).refine(data => {
    const times = data.botTransactionTimes.split(',');
    const addresses = data.botTransactionAddresses.split(',');
    return times.length === addresses.length;
}, {
    message: "The number of bot timestamps must match the number of bot addresses.",
});


const inputSchema = z.discriminatedUnion('type', [
  sandwichSchema,
  timeAnalyzerSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = inputSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({error: 'Invalid input.'}, {status: 400});
    }

    if (validatedFields.data.type === 'sandwich') {
      const result = await detectSandwichAttack(validatedFields.data);
      return NextResponse.json({data: result});
    }

    if (validatedFields.data.type === 'time') {
      const {type, botTransactionTimes, botTransactionAddresses, ...rest} = validatedFields.data;
      
      const times = botTransactionTimes.split(',').map(t => Number(t.trim())).filter(t => !isNaN(t));
      const addresses = botTransactionAddresses.split(',').map(a => a.trim());

      if (times.length === 0 || addresses.length === 0 || times.length !== addresses.length) {
        return NextResponse.json(
          {
            error:
              'Invalid bot transaction times or addresses format.',
          },
          {status: 400}
        );
      }
      
      const inputForFlow: AnalyzeTransactionTimeInput = {
          ...rest,
          botTransactions: times.map((time, index) => ({
              timestamp: time,
              address: addresses[index],
          }))
      };

      const result = await analyzeTransactionTime(inputForFlow);
      return NextResponse.json({
        data: {...result, attacker: result.botAddresses[0] || 'N/A'},
      });
    }

    // This part should not be reachable if the schema validation is correct, but it's good for type safety.
    return NextResponse.json({ error: 'Invalid analysis type.' }, { status: 400 });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {error: 'Failed to analyze transaction. Please try again.'},
      {status: 500}
    );
  }
}
