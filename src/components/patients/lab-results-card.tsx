import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LabResult } from '@/lib/types';
import { format } from 'date-fns';
import { Microscope } from 'lucide-react';

interface LabResultsCardProps {
  labResults: LabResult[];
}

export default function LabResultsCard({ labResults }: LabResultsCardProps) {
  const sortedResults = [...labResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Results</CardTitle>
        <CardDescription>Recent and historical lab results.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedResults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{format(new Date(result.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{result.testName}</TableCell>
                  <TableCell>{result.value}</TableCell>
                  <TableCell className="text-muted-foreground">{result.referenceRange || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-48">
            <Microscope className="mx-auto h-12 w-12" />
            <h3 className="mt-2 text-lg font-medium">No Lab Results</h3>
            <p className="mt-1 text-sm">No lab results found for this patient.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
