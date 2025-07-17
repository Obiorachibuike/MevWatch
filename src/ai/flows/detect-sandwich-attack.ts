'use server';

/**
 * @fileOverview This file implements a Genkit flow to detect sandwich attacks on Ethereum transactions.
 *
 * detectSandwichAttack - A function that analyzes transaction data to identify potential sandwich attacks.
 * DetectSandwichAttackInput - The input type for the detectSandwichAttack function.
 * DetectSandwichAttackOutput - The return type for the detectSandwichAttack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSandwichAttackInputSchema = z.object({
  transactionOrdering: z
    .string()
    .describe(
      'The order of transactions in the mempool, including the victim transaction and potential frontrunning/backrunning transactions.'
    ),
  gasPremiums: z
    .string()
    .describe('The gas premiums of the transactions in the mempool.'),
  slippage: z
    .string()
    .describe(
      'The slippage tolerance of the victim transaction and potential frontrunning/backrunning transactions.'
    ),
});
export type DetectSandwichAttackInput = z.infer<typeof DetectSandwichAttackInputSchema>;

const DetectSandwichAttackOutputSchema = z.object({
  isSandwichAttack: z
    .boolean()
    .describe('Whether or not the transaction sequence is a sandwich attack.'),
  attackerAddress: z
    .string()
    .describe('The Ethereum address of the suspected attacker.'),
  victimAddress: z
    .string()
    .describe('The Ethereum address of the victim.'),
  profitPotential: z
    .number()
    .describe('The potential profit (in ETH) the attacker could extract.'),
});
export type DetectSandwichAttackOutput = z.infer<typeof DetectSandwichAttackOutputSchema>;

export async function detectSandwichAttack(
  input: DetectSandwichAttackInput
): Promise<DetectSandwichAttackOutput> {
  return detectSandwichAttackFlow(input);
}

const detectSandwichAttackPrompt = ai.definePrompt({
  name: 'detectSandwichAttackPrompt',
  input: {schema: DetectSandwichAttackInputSchema},
  output: {schema: DetectSandwichAttackOutputSchema},
  prompt: `You are an expert in analyzing Ethereum mempool data to identify sandwich attacks.

  Given the following information about a sequence of transactions in the mempool, determine if it is a sandwich attack.
  Provide the output in JSON format with the fields: isSandwichAttack (true/false), attackerAddress, victimAddress, and profitPotential (in ETH).

  Transaction Ordering: {{{transactionOrdering}}}
  Gas Premiums: {{{gasPremiums}}}
  Slippage: {{{slippage}}}

  Consider a sandwich attack to be present if a victim transaction is surrounded by two transactions from the same attacker,
  where the attacker increases the price the victim pays, and then profits from the price movement caused by the victim's transaction.
`,
});

const detectSandwichAttackFlow = ai.defineFlow(
  {
    name: 'detectSandwichAttackFlow',
    inputSchema: DetectSandwichAttackInputSchema,
    outputSchema: DetectSandwichAttackOutputSchema,
  },
  async input => {
    const {output} = await detectSandwichAttackPrompt(input);
    return output!;
  }
);
