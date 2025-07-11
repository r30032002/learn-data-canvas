
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, GraduationCap } from 'lucide-react';

interface StudentListProps {
  data: any[];
  onStudentSelect: (student: any) => void;
  onAddStudent: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({ data, onStudentSelect, onAddStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique students from the data
  const students = data.reduce((acc, row) => {
    const studentId = row.student_id || row.Student_ID || row.id || row.ID;
    const studentName = row.name || row.Name || row.student_name || row.Student_Name;
    
    if (studentId && studentName) {
      const existingStudent = acc.find(s => s.id === studentId);
      if (!existingStudent) {
        acc.push({
          id: studentId,
          name: studentName,
          grades: data.filter(r => 
            (r.student_id || r.Student_ID || r.id || r.ID) === studentId
          )
        });
      }
    }
    return acc;
  }, [] as any[]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  const calculateAverage = (grades: any[]) => {
    const gradeFields = Object.keys(grades[0] || {}).filter(key => 
      !['name', 'Name', 'student_id', 'Student_ID', 'id', 'ID', 'student_name', 'Student_Name'].includes(key)
    );
    
    const allGrades = grades.flatMap(grade => 
      gradeFields.map(field => parseFloat(grade[field])).filter(g => !isNaN(g))
    );
    
    return allGrades.length > 0 
      ? (allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length).toFixed(1)
      : 'N/A';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student List
            </CardTitle>
            <CardDescription>
              {students.length} students enrolled
            </CardDescription>
          </div>
          <Button onClick={onAddStudent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => onStudentSelect(student)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">ID: {student.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Avg: {calculateAverage(student.grades)}</p>
                    <p className="text-xs text-gray-500">{student.grades.length} records</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No students found matching your search.' : 'No students found in the uploaded data.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
