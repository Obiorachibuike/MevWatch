
"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Clock, FileJson, Flame } from 'lucide-react';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeTransactionTimeAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import type { Attack } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    victimTransactionTime: z.coerce.number({invalid_type_error: "Must be a number."}).min(1, 'Victim transaction time is required.'),
    botTransactionTimes: z.string().min(1, 'At least one bot transaction time is required.'),
    botTransactionAddresses: z.string().min(1, 'At least one bot address is required.'),
    blockTimeThreshold: z.coerce.number().optional().default(12),
}).refine(data => {
    const times = data.botTransactionTimes.split(',');
    const addresses = data.botTransactionAddresses.split(',');
    return times.length === addresses.length;
}, {
    message: "The number of bot timestamps and addresses must match.",
    path: ["botTransactionAddresses"],
});

type TimeAnalyzerProps = {
    addAttack: (attack: Attack) => void;
};

interface AnalysisResult {
    isMEVBotActivity: boolean;
    numberOfCloseTransactions: number;
    botAddresses: string[];
    explanation: string;
    attacker: string;
}

export default function TimeAnalyzer({ addAttack }: TimeAnalyzerProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      victimTransactionTime: Math.floor(Date.now() / 1000),
      botTransactionTimes: `${Math.floor(Date.now() / 1000) - 5}, ${Math.floor(Date.now() / 1000) + 5}`,
      botTransactionAddresses: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B, 0x1Db3439a222C519ab44BB1144fC28167b4Fa6EE6",
      blockTimeThreshold: 12,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await axios.post('/api/analyze', { type: 'time', ...values });
        const responseData = response.data;

        if (responseData.error) {
          setError(responseData.error);
        } else if (responseData.data) {
          setResult(responseData.data);
          if (responseData.data.isMEVBotActivity) {
              const newAttack: Attack = {
                  id: crypto.randomUUID(),
                  type: 'Time-based',
                  victim: 'N/A (Time Analysis)',
                  attacker: responseData.data.attacker,
                  profit: 0,
                  timestamp: values.victimTransactionTime * 1000,
                  status: 'New',
              };
              addAttack(newAttack);
              toast({
                  title: "🕰️ Suspicious Timing Detected!",
                  description: `Bot ${newAttack.attacker.substring(0,10)}... acted suspiciously.`,
              });
          }
        }
      } catch (apiError) {
        console.warn("API call failed, falling back to server action.", apiError);
        const response = await analyzeTransactionTimeAction(values);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setResult(response.data);
          if (response.data.isMEVBotActivity) {
              const newAttack: Attack = {
                  id: crypto.randomUUID(),
                  type: 'Time-based',
                  victim: 'N/A (Time Analysis)',
                  attacker: response.data.attacker,
                  profit: 0,
                  timestamp: values.victimTransactionTime * 1000,
                  status: 'New',
              };
              addAttack(newAttack);
              toast({
                  title: "🕰️ Suspicious Timing Detected! (Fallback)",
                  description: `Bot ${newAttack.attacker.substring(0,10)}... acted suspiciously.`,
              });
          }
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-based MEV Analyzer</CardTitle>
        <CardDescription>Analyze transaction timestamps to detect potential MEV bot activity.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="victimTransactionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Victim Transaction Timestamp (Unix)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1678901234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="botTransactionTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Timestamps (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 1678901230, 1678901238" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="botTransactionAddresses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Addresses (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 0x..., 0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blockTimeThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Time Threshold (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
                {isPending ? "Analyzing..." : "Analyze Timestamps"}
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
            <Alert variant={result.isMEVBotActivity ? "destructive" : "default"} className={!result.isMEVBotActivity ? "border-green-500 text-green-800" : ""}>
                <FileJson className="h-4 w-4" />
                <AlertTitle>{result.isMEVBotActivity ? "MEV Bot Activity Suspected!" : "No Suspicious Activity Detected"}</AlertTitle>
                <AlertDescription className="text-current">
                    <div className="space-y-2 mt-2">
                        <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> <strong>Close Transactions:</strong> {result.numberOfCloseTransactions}</p>
                        <p className="flex items-center"><AlertTriangle className="mr-2 h-4 w-4" /> <strong>Explanation:</strong> {result.explanation}</p>
                         {result.isMEVBotActivity && result.botAddresses.length > 0 && (
                            <div className="pt-2">
                                <h4 className="font-semibold">Suspected Bot Addresses:</h4>
                                <ul className="list-disc pl-5">
                                    {result.botAddresses.map((addr, i) => <li key={i} className="font-mono text-xs">{addr}</li>)}
                                </ul>
                            </div>
                         )}
                    </div>
                </AlertDescription>
            </Alert>
        </div>
      )}
    </Card>
  );
}
