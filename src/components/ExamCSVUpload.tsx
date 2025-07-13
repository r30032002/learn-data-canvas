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

  const extractTotalPointFromCSV = (csvText: string): number | null => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return null;
      
      // Parse the second row to find Total Point
      const secondRow = lines[1];
      const values = secondRow.split('\t').map(v => v.trim()); // Try tab first
      
      // If tab split doesn't work well, try comma
      const finalValues = values.length < 4 ? secondRow.split(',').map(v => v.trim()) : values;
      
      // Look for the Total Point value (should be around index 3 based on the format)
      for (let i = 0; i < finalValues.length; i++) {
        const value = parseInt(finalValues[i]);
        if (!isNaN(value) && value > 0 && value <= 100) { // Reasonable range for question count
          console.log(`Extracted Total Point: ${value} from position ${i}`);
          return value;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting Total Point:', error);
      return null;
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    
    // Skip first two rows and use third row as headers
    if (lines.length < 4) {
      throw new Error('CSV file must have at least 4 rows (assignment info, totals, headers, and data)');
    }
    
    // Row 3 (index 2) contains the headers
    const headerRow = lines[2];
    const delimiter = headerRow.includes('\t') ? '\t' : ',';
    
    const headers = headerRow.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers);
    
    // Rows 4+ (index 3+) contain the student data
    const data = lines.slice(3).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, headerIndex) => {
        obj[header] = values[headerIndex] || '';
      });
      console.log(`Student row ${index + 1}:`, obj);
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
    console.log('Available headers:', headers);
    
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

  const handleFileUpload = async (file: File, subject: SubjectType) => {
    setError(null);
    setUploadingSubject(subject);
    
    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }
      
      const text = await file.text();
      console.log('Raw CSV text preview:', text.substring(0, 500));
      
      // Extract total questions from CSV and update the question count
      const extractedTotal = extractTotalPointFromCSV(text);
      if (extractedTotal !== null) {
        console.log(`Auto-detected ${extractedTotal} questions for ${subject}`);
        setQuestionCounts(prev => ({
          ...prev,
          [subject]: extractedTotal
        }));
      }
      
      const parsedData = parseCSV(text);
      console.log('Parsed data preview:', parsedData.slice(0, 2));
      validateData(parsedData);
      
      // Process with the updated question count (either extracted or current)
      const currentQuestionCount = extractedTotal !== null ? extractedTotal : questionCounts[subject];
      const processedData = parsedData.map(row => {
        // Extract student name from various possible columns
        const firstName = row['First Name'] || row['firstname'] || '';
        const lastName = row['Last Name'] || row['lastname'] || '';
        const middleName = row['Middle Name'] || row['middlename'] || '';
        
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
        
        // Extract score - try different possible column names
        const rawScore = parseInt(row['Score'] || row['score'] || row['Total Score'] || '0');
        const percentage = currentQuestionCount > 0 ? (rawScore / currentQuestionCount) * 100 : 0;
        
        console.log(`Processing student: ${fullName}, Score: ${rawScore}/${currentQuestionCount} = ${percentage.toFixed(2)}%`);
        
        return {
          name: fullName || row['Username'] || row['username'] || 'Unknown',
          student_id: row['SIS ID'] || row['Student Number'] || row['Username'] || row['username'] || `${subject}_${Math.random().toString(36).substr(2, 9)}`,
          score: rawScore,
          total_questions: currentQuestionCount,
          percentage: Math.round(percentage * 100) / 100,
          subject: subject,
          username: row['Username'] || row['username'] || '',
          // Keep original data for reference
          ...row
        };
      });
      
      console.log('Final processed data:', processedData.slice(0, 2));
      onUploadComplete(examSet.id, subject, processedData);
    } catch (err) {
      console.error('Upload error:', err);
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
              The system automatically detects question counts from CSV files. You can manually adjust them here if needed.
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
                      {questionCounts[subject.key] !== SUBJECTS.find(s => s.key === subject.key)!.defaultQuestions && (
                        <span className="text-blue-600"> (auto-detected)</span>
                      )}
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
                        Format: Assignment info (row 1), totals (row 2), headers (row 3), data (row 4+)
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
