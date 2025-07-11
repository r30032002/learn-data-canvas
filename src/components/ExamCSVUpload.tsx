import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, Settings } from 'lucide-react';
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

const SUBJECTS: { 
  key: SubjectType; 
  label: string; 
  description: string;
  defaultQuestions: number;
}[] = [
  { key: 'verbal', label: 'Verbal Reasoning', description: 'Upload verbal reasoning test results', defaultQuestions: 60 },
  { key: 'numerical', label: 'Numerical Reasoning', description: 'Upload numerical reasoning test results', defaultQuestions: 50 },
  { key: 'maths', label: 'Mathematics', description: 'Upload mathematics test results', defaultQuestions: 40 },
  { key: 'reading', label: 'Reading Comprehension', description: 'Upload reading comprehension test results', defaultQuestions: 45 }
];

export const ExamCSVUpload: React.FC<ExamCSVUploadProps> = ({
  examSet,
  onUploadComplete,
  onBack,
  onViewDashboard
}) => {
  const [uploadingSubject, setUploadingSubject] = useState<SubjectType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<SubjectType, number>>(
    SUBJECTS.reduce((acc, subject) => ({
      ...acc,
      [subject.key]: subject.defaultQuestions
    }), {} as Record<SubjectType, number>)
  );
  const [showSettings, setShowSettings] = useState(false);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    
    // Skip first two rows and use third row as headers
    if (lines.length < 4) {
      throw new Error('CSV file must have at least 4 rows (including headers)');
    }
    
    const headers = lines[2].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(3).map(line => {
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
      throw new Error('CSV file contains no student data');
    }
    
    const firstRow = data[0];
    const headers = Object.keys(firstRow).map(h => h.toLowerCase());
    
    // Check for required fields based on the format shown
    const hasName = headers.some(header => 
      header.includes('first name') || header.includes('firstname') || header.includes('name')
    );
    const hasScore = headers.some(header => 
      header.includes('score') && !header.includes('%')
    );
    
    if (!hasName) {
      throw new Error('CSV must contain a student name column (First Name, etc.)');
    }
    
    if (!hasScore) {
      throw new Error('CSV must contain a Score column');
    }
    
    return true;
  };

  const processStudentData = (data: any[], subject: SubjectType) => {
    const totalQuestions = questionCounts[subject];
    
    return data.map(row => {
      // Extract student name from various possible columns
      const firstName = row['First Name'] || row['firstname'] || '';
      const lastName = row['Last Name'] || row['lastname'] || '';
      const middleName = row['Middle Name'] || row['middlename'] || '';
      
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
      
      // Extract score
      const rawScore = parseInt(row['Score'] || row['score'] || '0');
      const percentage = totalQuestions > 0 ? (rawScore / totalQuestions) * 100 : 0;
      
      return {
        name: fullName || row['Username'] || row['username'] || 'Unknown',
        student_id: row['SIS ID'] || row['Student Number'] || row['Username'] || row['username'] || `${subject}_${Math.random().toString(36).substr(2, 9)}`,
        score: rawScore,
        total_questions: totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        subject: subject,
        username: row['Username'] || row['username'] || '',
        // Keep original data for reference
        ...row
      };
    });
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
      
      const processedData = processStudentData(parsedData, subject);
      onUploadComplete(examSet.id, subject, processedData);
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

  const handleQuestionCountChange = (subject: SubjectType, count: number) => {
    setQuestionCounts(prev => ({
      ...prev,
      [subject]: Math.max(1, count)
    }));
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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Questions
          </Button>
          {allUploaded && (
            <Button onClick={onViewDashboard} className="bg-green-600 hover:bg-green-700">
              View Dashboard
            </Button>
          )}
        </div>
      </div>

      {showSettings && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Question Count Configuration</CardTitle>
            <CardDescription>
              Set the total number of questions for each subject to calculate accurate percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SUBJECTS.map((subject) => (
                <div key={subject.key} className="space-y-2">
                  <Label htmlFor={`questions-${subject.key}`} className="text-sm font-medium">
                    {subject.label}
                  </Label>
                  <Input
                    id={`questions-${subject.key}`}
                    type="number"
                    min="1"
                    value={questionCounts[subject.key]}
                    onChange={(e) => handleQuestionCountChange(subject.key, parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <p className="text-xs text-gray-500 mt-1">
                      Total Questions: {questionCounts[subject.key]}
                    </p>
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
                      <p className="text-xs text-gray-500">
                        Format: Skip first 2 rows, headers in row 3
                      </p>
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
