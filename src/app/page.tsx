
"use client";

import { useState } from 'react';
import { AlertTriangle, Bot, DollarSign, Users } from 'lucide-react';
import Header from '@/components/header';
import StatsCard from '@/components/stats-card';
import AttacksTable from '@/components/attacks-table';
import SandwichDetector from '@/components/sandwich-detector';
import TimeAnalyzer from '@/components/time-analyzer';
import { Toaster } from '@/components/ui/toaster';
import type { Attack } from '@/types';

const initialAttacks: Attack[] = [
    {
        id: 'initial-1',
        type: 'Sandwich',
        victim: '0x1A4b8b6EC3Ab8616A5a6A7A45F6A42d5A444871b',
        attacker: '0xBADc0DEDeaf5A55bDA9f4A7E28383a176846B7E2',
        profit: 0.42,
        timestamp: Date.now() - 3600000,
        status: 'Deduplicated'
    },
    {
        id: 'initial-2',
        type: 'Time-based',
        victim: 'N/A (Time Analysis)',
        attacker: '0x55d398326f99059fF775485246999027B3197955',
        profit: 0,
        timestamp: Date.now() - 7200000,
        status: 'Deduplicated'
    }
];

export default function Home() {
  const [attacks, setAttacks] = useState<Attack[]>(initialAttacks);

  const addAttack = (newAttack: Attack) => {
    setAttacks(prevAttacks => [newAttack, ...prevAttacks]);
  };
  
  const totalProfit = attacks.reduce((sum, attack) => sum + attack.profit, 0);
  const uniqueVictims = new Set(attacks.map(a => a.victim)).size;
  const uniqueAttackers = new Set(attacks.map(a => a.attacker)).size;

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Header />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Attacks Detected (24h)" 
            value={attacks.filter(a => a.timestamp > Date.now() - 24 * 60 * 60 * 1000).length.toString()}
            icon={AlertTriangle}
            description="+2 since last hour"
          />
          <StatsCard 
            title="Total Profit (ETH)" 
            value={`Ξ ${totalProfit.toFixed(2)}`}
            icon={DollarSign}
            description="Across all detected attacks"
          />
          <StatsCard 
            title="Unique Victims" 
            value={uniqueVictims.toString()}
            icon={Users}
            description="Total victims impacted"
          />
          <StatsCard 
            title="Active MEV Bots" 
            value={uniqueAttackers.toString()}
            icon={Bot}
            description="Unique attacker addresses"
          />
        </section>

        <section className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <SandwichDetector addAttack={addAttack} />
            <TimeAnalyzer addAttack={addAttack} />
        </section>

        <section>
            <AttacksTable attacks={attacks} />
        </section>
      </main>
      <Toaster />
    </div>
  );
}
