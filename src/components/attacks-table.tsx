
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Attack } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";

interface AttacksTableProps {
  attacks: Attack[];
}

function FormattedTimestamp({ timestamp }: { timestamp: number }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // Render nothing on the server and initial client render
    }

    return <>{new Date(timestamp).toLocaleString()}</>;
}

export default function AttacksTable({ attacks }: AttacksTableProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
            <CardTitle>MEV Attack Log</CardTitle>
            <CardDescription>A real-time log of detected MEV bot activities.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[400px]">
                <Table>
                    <TableHeader className="sticky top-0 bg-card">
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Victim</TableHead>
                            <TableHead>Attacker</TableHead>
                            <TableHead className="text-right">Profit (ETH)</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attacks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No attacks detected yet. Use the tools above to find MEV activity.
                                </TableCell>
                            </TableRow>
                        )}
                        {attacks.map((attack) => (
                            <TableRow key={attack.id}>
                                <TableCell>
                                    <Badge variant={attack.type === 'Sandwich' ? 'destructive' : 'secondary'}>
                                        {attack.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs truncate max-w-xs">{attack.victim}</TableCell>
                                <TableCell className="font-mono text-xs truncate max-w-xs">{attack.attacker}</TableCell>
                                <TableCell className="text-right font-medium text-accent-foreground/80">{attack.profit.toFixed(4)}</TableCell>
                                <TableCell>
                                    <FormattedTimestamp timestamp={attack.timestamp} />
                                </TableCell>
                                <TableCell>
                                    <Badge variant={attack.status === 'New' ? 'default' : 'outline'} className={attack.status === 'New' ? 'bg-accent text-accent-foreground animate-pulse' : ''}>
                                        {attack.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
    </Card>
  );
}
