
import {NextRequest, NextResponse} from 'next/server';
import {
  detectSandwichAttack,
} from '@/ai/flows/detect-sandwich-attack';
import {
  analyzeTransactionTime,
  AnalyzeTransactionTimeInput,
} from '@/ai/flows/analyze-transaction-time';
import { apiInputSchema } from '@/lib/schemas';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = apiInputSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({error: 'Invalid input.'}, {status: 400});
    }

    if (validatedFields.data.type === 'sandwich') {
      const { type, ...rest } = validatedFields.data;
      const result = await detectSandwichAttack(rest);
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

    return NextResponse.json({ error: 'Invalid analysis type.' }, { status: 400 });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {error: 'Failed to analyze transaction. Please try again.'},
      {status: 500}
    );
  }
}
