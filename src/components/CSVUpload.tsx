
import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploadProps {
  onDataUpload: (data: any[]) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onDataUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
    
    return data;
  };

  const validateData = (data: any[]) => {
    if (data.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    const requiredFields = ['name', 'student_id'];
    const firstRow = data[0];
    const headers = Object.keys(firstRow).map(h => h.toLowerCase());
    
    const hasRequiredFields = requiredFields.some(field => 
      headers.some(header => header.includes(field))
    );
    
    if (!hasRequiredFields) {
      throw new Error('CSV must contain student name and ID columns');
    }
    
    return true;
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    
    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }
      
      const text = await file.text();
      const parsedData = parseCSV(text);
      validateData(parsedData);
      
      onDataUpload(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Student Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file containing student academic data. Include columns for student name, ID, and grades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="mb-4">
            <p className="text-lg font-medium mb-2">
              Drop your CSV file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports CSV files up to 10MB
            </p>
          </div>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload"
            disabled={isProcessing}
          />
          
          <Button
            asChild
            variant="outline"
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <label htmlFor="csv-upload">
              {isProcessing ? 'Processing...' : 'Choose File'}
            </label>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">CSV Format Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Include headers in the first row</li>
            <li>Required: Student Name, Student ID columns</li>
            <li>Recommended: Subject grades (Math, Science, English, etc.)</li>
            <li>Example: Name, Student_ID, Math, Science, English</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
