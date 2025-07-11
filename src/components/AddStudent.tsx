
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, X } from 'lucide-react';

interface AddStudentProps {
  onAddStudent: (student: any) => void;
  onCancel: () => void;
  existingData: any[];
}

export const AddStudent: React.FC<AddStudentProps> = ({ onAddStudent, onCancel, existingData }) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grades, setGrades] = useState<{[key: string]: string}>({});

  // Get subject fields from existing data
  const subjectFields = existingData.length > 0 
    ? Object.keys(existingData[0]).filter(key => 
        !['name', 'Name', 'student_id', 'Student_ID', 'id', 'ID', 'student_name', 'Student_Name'].includes(key)
      )
    : [];

  const handleGradeChange = (subject: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [subject]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentId.trim()) {
      alert('Please fill in student name and ID');
      return;
    }

    const newStudent = {
      name: studentName,
      student_id: studentId,
      ...grades
    };

    onAddStudent(newStudent);
    
    // Reset form
    setStudentName('');
    setStudentId('');
    setGrades({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Student
            </CardTitle>
            <CardDescription>
              Enter student information and current grades
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                required
              />
            </div>
          </div>

          {subjectFields.length > 0 && (
            <div>
              <Label className="text-base font-medium">Subject Grades</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {subjectFields.map((subject) => (
                  <div key={subject} className="space-y-2">
                    <Label htmlFor={subject}>
                      {subject.replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <Input
                      id={subject}
                      type="number"
                      min="0"
                      max="100"
                      value={grades[subject] || ''}
                      onChange={(e) => handleGradeChange(subject, e.target.value)}
                      placeholder="Enter grade (0-100)"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Add Student
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
