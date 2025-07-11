
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StudentDetailProps {
  student: any;
  onBack: () => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack }) => {
  // Extract grade fields (excluding name and ID fields)
  const gradeFields = Object.keys(student.grades[0] || {}).filter(key => 
    !['name', 'Name', 'student_id', 'Student_ID', 'id', 'ID', 'student_name', 'Student_Name'].includes(key)
  );

  // Calculate averages and trends
  const subjectAverages = gradeFields.map(subject => {
    const grades = student.grades.map(record => parseFloat(record[subject])).filter(g => !isNaN(g));
    const average = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
    return {
      subject: subject.replace(/_/g, ' ').toUpperCase(),
      average: parseFloat(average.toFixed(1)),
      count: grades.length
    };
  });

  const overallAverage = subjectAverages.length > 0 
    ? subjectAverages.reduce((sum, sub) => sum + sub.average, 0) / subjectAverages.length 
    : 0;

  // Prepare data for trend chart (if there are multiple records)
  const trendData = student.grades.map((record, index) => ({
    exam: `Exam ${index + 1}`,
    ...gradeFields.reduce((acc, field) => {
      acc[field] = parseFloat(record[field]) || 0;
      return acc;
    }, {} as any)
  }));

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceIcon = (average: number) => {
    return average >= 75 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription>Student ID: {student.id}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{overallAverage.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Overall Average</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{student.grades.length}</p>
              <p className="text-sm text-gray-600">Total Exams</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{gradeFields.length}</p>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectAverages.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPerformanceIcon(subject.average)}
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-sm text-gray-500">{subject.count} exams</p>
                    </div>
                  </div>
                  <Badge className={getGradeColor(subject.average)}>
                    {subject.average}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Track performance across multiple exams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                {gradeFields.map((field, index) => (
                  <Line 
                    key={field}
                    type="monotone" 
                    dataKey={field} 
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
          <CardDescription>Detailed breakdown of all exam results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {student.grades.map((exam, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Exam {index + 1}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {gradeFields.map((field) => (
                    <div key={field} className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{field.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="font-bold text-lg">{exam[field] || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
