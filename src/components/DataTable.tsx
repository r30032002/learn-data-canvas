
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DataTableProps {
  data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const displayHeaders = headers.slice(0, 8); // Limit columns for better display

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Student Data Preview
        </CardTitle>
        <CardDescription>
          Showing {data.length} students • {headers.length} columns
          {headers.length > 8 && ` (displaying first 8 columns)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {displayHeaders.map((header) => (
                  <TableHead key={header} className="font-medium">
                    {header.replace(/_/g, ' ').toUpperCase()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((row, index) => (
                <TableRow key={index}>
                  {displayHeaders.map((header) => (
                    <TableCell key={header}>
                      {row[header] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 10 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing first 10 rows of {data.length} total students
          </p>
        )}
      </CardContent>
    </Card>
  );
};
