import { z } from 'zod';

export const sandwichSchema = z.object({
  transactionOrdering: z.string().min(1, 'Transaction ordering is required.'),
  gasPremiums: z.string().min(1, 'Gas premiums are required.'),
  slippage: z.string().min(1, 'Slippage is required.'),
});

// Base schema without refinement, can be extended
const timeAnalyzerBaseSchema = z.object({
    victimTransactionTime: z.coerce.number({invalid_type_error: "Must be a number."}).min(1, 'Victim transaction time is required.'),
    botTransactionTimes: z.string().min(1, 'At least one bot transaction time is required.'),
    botTransactionAddresses: z.string().min(1, 'At least one bot address is required.'),
    blockTimeThreshold: z.coerce.number().optional().default(12),
});

// Schema with refinement for form validation
export const timeAnalyzerSchema = timeAnalyzerBaseSchema.refine(data => {
    const times = data.botTransactionTimes.split(',');
    const addresses = data.botTransactionAddresses.split(',');
    return times.length === addresses.length;
}, {
    message: "The number of bot timestamps and addresses must match.",
    path: ["botTransactionAddresses"],
});


export const apiSandwichSchema = sandwichSchema.extend({
  type: z.literal('sandwich'),
});

// Use the base schema to extend for the API
export const apiTimeAnalyzerSchema = timeAnalyzerBaseSchema.extend({
  type: z.literal('time'),
});


export const apiInputSchema = z.discriminatedUnion('type', [
  apiSandwichSchema,
  apiTimeAnalyzerSchema,
]);
