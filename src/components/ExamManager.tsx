
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, FileSpreadsheet, Users } from 'lucide-react';

interface ExamSet {
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
  studentCount: number;
}

interface ExamManagerProps {
  examSets: ExamSet[];
  onCreateExam: (examSet: Omit<ExamSet, 'id' | 'csvUploads' | 'studentCount'>) => void;
  onSelectExam: (examSet: ExamSet) => void;
}

export const ExamManager: React.FC<ExamManagerProps> = ({ 
  examSets, 
  onCreateExam, 
  onSelectExam 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examDescription, setExamDescription] = useState('');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examName.trim() || !examDate) {
      alert('Please fill in exam name and date');
      return;
    }

    onCreateExam({
      name: examName,
      date: examDate,
      description: examDescription
    });

    // Reset form
    setExamName('');
    setExamDate('');
    setExamDescription('');
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Exam Set
          </CardTitle>
          <CardDescription>
            Create a new exam set to upload and track student performance across 4 subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Mid-term Exams October 2024"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="examDescription">Description (Optional)</Label>
              <Input
                id="examDescription"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="Additional details about this exam set"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Exam Set
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Sets</h2>
          <p className="text-gray-600">Manage your exam periods and track student performance</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Exam Set
        </Button>
      </div>

      {examSets.length === 0 ? (
        <Card className="text-center p-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Exam Sets Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first exam set to start tracking student performance across multiple subjects
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Your First Exam Set
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {examSets.map((examSet) => (
            <Card 
              key={examSet.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectExam(examSet)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{examSet.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(examSet.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {examSet.studentCount} students
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {['verbal', 'numerical', 'maths', 'reading'].map((subject) => (
                      <div
                        key={subject}
                        className={`w-3 h-3 rounded-full ${
                          examSet.csvUploads[subject as keyof typeof examSet.csvUploads]
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                        title={`${subject} - ${
                          examSet.csvUploads[subject as keyof typeof examSet.csvUploads]
                            ? 'Uploaded'
                            : 'Not uploaded'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {examSet.description && (
                  <p className="text-sm text-gray-600 mt-2">{examSet.description}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
