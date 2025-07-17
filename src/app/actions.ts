
'use server';

import { detectSandwichAttack, DetectSandwichAttackInput } from '@/ai/flows/detect-sandwich-attack';
import { analyzeTransactionTime, AnalyzeTransactionTimeInput } from '@/ai/flows/analyze-transaction-time';
import { z } from 'zod';

const sandwichSchema = z.object({
  transactionOrdering: z.string().min(1, 'Transaction ordering is required.'),
  gasPremiums: z.string().min(1, 'Gas premiums are required.'),
  slippage: z.string().min(1, 'Slippage is required.'),
});

export async function detectSandwichAttackAction(values: DetectSandwichAttackInput) {
    const validatedFields = sandwichSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }

    try {
        const result = await detectSandwichAttack(validatedFields.data);
        return { data: result };
    } catch (e) {
        return { error: 'Failed to analyze transaction. Please try again.' };
    }
}

const timeAnalyzerSchema = z.object({
    victimTransactionTime: z.coerce.number().min(1, 'Victim transaction time is required.'),
    botTransactionTimes: z.string().min(1, 'Bot transaction times are required.'),
    botTransactionAddresses: z.string().min(1, 'Bot transaction addresses are required.'),
    blockTimeThreshold: z.coerce.number().optional().default(12),
}).refine(data => {
    const times = data.botTransactionTimes.split(',');
    const addresses = data.botTransactionAddresses.split(',');
    return times.length === addresses.length;
}, {
    message: "The number of bot timestamps must match the number of bot addresses.",
    path: ["botTransactionAddresses"],
});

export async function analyzeTransactionTimeAction(values: z.infer<typeof timeAnalyzerSchema>) {
    const validatedFields = timeAnalyzerSchema.safeParse(values);

    if (!validatedFields.success) {
        const firstError = validatedFields.error.errors[0];
        return { error: firstError?.message || 'Invalid input. Please check the form.' };
    }
    
    const times = validatedFields.data.botTransactionTimes.split(',').map(t => Number(t.trim())).filter(t => !isNaN(t));
    const addresses = validatedFields.data.botTransactionAddresses.split(',').map(a => a.trim());

    if(times.length === 0 || addresses.length === 0 || times.length !== addresses.length) {
        return { error: 'Invalid bot transaction times or addresses format.' };
    }

    const inputForFlow: AnalyzeTransactionTimeInput = {
        victimTransactionTime: validatedFields.data.victimTransactionTime,
        botTransactions: times.map((time, index) => ({
            timestamp: time,
            address: addresses[index],
        })),
        blockTimeThreshold: validatedFields.data.blockTimeThreshold,
    };

    try {
        const result = await analyzeTransactionTime(inputForFlow);
        return { data: { ...result, attacker: result.botAddresses[0] || 'N/A' } };
    } catch (e) {
        return { error: 'Failed to analyze transaction time. Please try again.' };
    }
}
