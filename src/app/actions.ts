
'use server';

import { detectSandwichAttack, DetectSandwichAttackInput } from '@/ai/flows/detect-sandwich-attack';
import { analyzeTransactionTime, AnalyzeTransactionTimeInput } from '@/ai/flows/analyze-transaction-time';
import { z } from 'zod';
import { sandwichSchema, timeAnalyzerSchema } from '@/lib/schemas';


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
