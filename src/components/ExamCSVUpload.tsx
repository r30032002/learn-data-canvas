
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExamCSVUploadProps {
  examSet: {
    id: string;
    name: string;
    date: string;
    description: string;
    csvUploads: {
      verbal?: any[];
      numerical?: any[];
      maths?: any[];
      reading?: any[];
    };
  };
  onUploadComplete: (examId: string, subject: string, data: any[]) => void;
  onBack: () => void;
  onViewDashboard: () => void;
}

type SubjectType = 'verbal' | 'numerical' | 'maths' | 'reading';

const SUBJECTS: { key: SubjectType; label: string; description: string }[] = [
  { key: 'verbal', label: 'Verbal Reasoning', description: 'Upload verbal reasoning test results' },
  { key: 'numerical', label: 'Numerical Reasoning', description: 'Upload numerical reasoning test results' },
  { key: 'maths', label: 'Mathematics', description: 'Upload mathematics test results' },
  { key: 'reading', label: 'Reading Comprehension', description: 'Upload reading comprehension test results' }
];

export const ExamCSVUpload: React.FC<ExamCSVUploadProps> = ({
  examSet,
  onUploadComplete,
  onBack,
  onViewDashboard
}) => {
  const [uploadingSubject, setUploadingSubject] = useState<SubjectType | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileUpload = async (file: File, subject: SubjectType) => {
    setError(null);
    setUploadingSubject(subject);
    
    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }
      
      const text = await file.text();
      const parsedData = parseCSV(text);
      validateData(parsedData);
      
      onUploadComplete(examSet.id, subject, parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setUploadingSubject(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, subject: SubjectType) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], subject);
    }
  };

  const uploadedCount = Object.values(examSet.csvUploads).filter(data => data && data.length > 0).length;
  const allUploaded = uploadedCount === 4;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exam Sets
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{examSet.name}</h2>
            <p className="text-gray-600">
              Upload CSV files for all 4 subjects • {uploadedCount}/4 completed
            </p>
          </div>
        </div>
        {allUploaded && (
          <Button onClick={onViewDashboard} className="bg-green-600 hover:bg-green-700">
            View Dashboard
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBJECTS.map((subject) => {
          const isUploaded = examSet.csvUploads[subject.key] && examSet.csvUploads[subject.key].length > 0;
          const isUploading = uploadingSubject === subject.key;
          
          return (
            <Card key={subject.key} className={`relative ${isUploaded ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isUploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Upload className="h-5 w-5 text-gray-400" />
                      )}
                      {subject.label}
                    </CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  
                  {isUploaded ? (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">
                        ✓ Uploaded ({examSet.csvUploads[subject.key]!.length} students)
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileInput(e, subject.key)}
                        className="hidden"
                        id={`${subject.key}-reupload`}
                        disabled={isUploading}
                      />
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                      >
                        <label htmlFor={`${subject.key}-reupload`} className="cursor-pointer">
                          Replace File
                        </label>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">Upload {subject.label} CSV</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileInput(e, subject.key)}
                        className="hidden"
                        id={`${subject.key}-upload`}
                        disabled={isUploading}
                      />
                      <Button
                        asChild
                        variant="outline"
                        disabled={isUploading}
                      >
                        <label htmlFor={`${subject.key}-upload`} className="cursor-pointer">
                          {isUploading ? 'Uploading...' : 'Choose File'}
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allUploaded && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">All subjects uploaded successfully!</h3>
                <p className="text-green-700">You can now view the comprehensive dashboard for this exam set.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
