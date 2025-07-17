
"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, FileJson, Flame, User } from 'lucide-react';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { detectSandwichAttackAction } from '@/app/actions';
import type { DetectSandwichAttackOutput } from '@/ai/flows/detect-sandwich-attack';
import type { Attack } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  transactionOrdering: z.string().min(10, { message: "Please provide more details on transaction ordering." }),
  gasPremiums: z.string().min(5, { message: "Please provide details on gas premiums." }),
  slippage: z.string().min(1, { message: "Please provide details on slippage." }),
});

type SandwichDetectorProps = {
    addAttack: (attack: Attack) => void;
};

export default function SandwichDetector({ addAttack }: SandwichDetectorProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DetectSandwichAttackOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionOrdering: "Attacker Tx (Buy), Victim Tx (Buy), Attacker Tx (Sell)",
      gasPremiums: "Attacker front-run: +50 Gwei, Attacker back-run: -5 Gwei",
      slippage: "Victim slippage tolerance: 2%",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await axios.post('/api/analyze', { type: 'sandwich', ...values });
        const responseData = response.data;

        if (responseData.error) {
          setError(responseData.error);
        } else if (responseData.data) {
          setResult(responseData.data);
          if (responseData.data.isSandwichAttack) {
              const newAttack: Attack = {
                  id: crypto.randomUUID(),
                  type: 'Sandwich',
                  victim: responseData.data.victimAddress,
                  attacker: responseData.data.attackerAddress,
                  profit: responseData.data.profitPotential,
                  timestamp: Date.now(),
                  status: 'New',
              };
              addAttack(newAttack);
              toast({
                title: "🚨 Sandwich Attack Detected!",
                description: `Attacker ${newAttack.attacker.substring(0,10)}... profited ${newAttack.profit.toFixed(2)} ETH.`,
                variant: "destructive"
              });
          }
        }
      } catch (apiError) {
        console.warn("API call failed, falling back to server action.", apiError);
        const response = await detectSandwichAttackAction(values);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setResult(response.data);
          if (response.data.isSandwichAttack) {
              const newAttack: Attack = {
                  id: crypto.randomUUID(),
                  type: 'Sandwich',
                  victim: response.data.victimAddress,
                  attacker: response.data.attackerAddress,
                  profit: response.data.profitPotential,
                  timestamp: Date.now(),
                  status: 'New',
              };
              addAttack(newAttack);
              toast({
                title: "🚨 Sandwich Attack Detected! (Fallback)",
                description: `Attacker ${newAttack.attacker.substring(0,10)}... profited ${newAttack.profit.toFixed(2)} ETH.`,
                variant: "destructive"
              });
          }
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sandwich Attack Detector</CardTitle>
        <CardDescription>Analyze transaction data to identify potential sandwich attacks.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="transactionOrdering"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Ordering</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Attacker Tx1, Victim Tx, Attacker Tx2..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gasPremiums"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gas Premiums</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Attacker: +50 gwei, Victim: normal" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slippage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slippage Tolerance</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Victim: 3%, Attacker buys/sells within this" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
                {isPending ? "Analyzing..." : "Detect Attack"}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {error && (
          <div className="p-6 pt-0">
            <Alert variant="destructive">
                <Flame className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
      )}
      {result && (
        <div className="p-6 pt-0">
            <Alert variant={result.isSandwichAttack ? "destructive" : "default"} className={!result.isSandwichAttack ? "border-green-500 text-green-800" : ""}>
                <FileJson className="h-4 w-4" />
                <AlertTitle>{result.isSandwichAttack ? "Sandwich Attack Detected!" : "No Sandwich Attack Detected"}</AlertTitle>
                <AlertDescription className="text-current">
                   {result.isSandwichAttack ? (
                    <div className="space-y-2 mt-2">
                        <p className="flex items-center"><Bot className="mr-2 h-4 w-4" /> <strong>Attacker:</strong> <span className="font-mono text-xs ml-2">{result.attackerAddress}</span></p>
                        <p className="flex items-center"><User className="mr-2 h-4 w-4" /> <strong>Victim:</strong> <span className="font-mono text-xs ml-2">{result.victimAddress}</span></p>
                        <p className="flex items-center"><span className="font-bold mr-2">Ξ</span> <strong>Potential Profit:</strong> {result.profitPotential.toFixed(4)} ETH</p>
                    </div>
                   ) : "The transaction sequence does not appear to be a sandwich attack."}
                </AlertDescription>
            </Alert>
        </div>
      )}
    </Card>
  );
}
