
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, Users, TrendingUp, Plus, BookOpen, FileSpreadsheet } from 'lucide-react';

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

interface TeacherDashboardProps {
  examSets: ExamSet[];
  onCreateExam: () => void;
  onManageExams: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  examSets, 
  onCreateExam, 
  onManageExams 
}) => {
  // Calculate summary statistics
  const totalExamSets = examSets.length;
  const totalStudents = examSets.reduce((sum, exam) => sum + exam.studentCount, 0);
  const totalUploads = examSets.reduce((sum, exam) => {
    return sum + Object.values(exam.csvUploads).filter(upload => upload && upload.length > 0).length;
  }, 0);
  const recentExams = examSets
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <BarChart3 className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back, Teacher!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track student performance, manage exam sets, and gain insights from your classroom data.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exam Sets</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExamSets}</div>
            <p className="text-xs text-muted-foreground">
              Exam periods created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all exam sets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSV Uploads</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Subject data files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examSets.filter(exam => Object.keys(exam.csvUploads).length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active exam sets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onCreateExam}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Exam Set</CardTitle>
                <CardDescription>
                  Set up a new exam period and start uploading student performance data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onManageExams}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Manage Exam Sets</CardTitle>
                <CardDescription>
                  View, edit, and analyze your existing exam sets and student data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Exam Sets */}
      {recentExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Exam Sets
            </CardTitle>
            <CardDescription>Your most recently created exam sets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{exam.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                      <span>{exam.studentCount} students</span>
                      <span>{Object.values(exam.csvUploads).filter(upload => upload && upload.length > 0).length}/4 subjects uploaded</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {['verbal', 'numerical', 'maths', 'reading'].map((subject) => (
                      <div
                        key={subject}
                        className={`w-3 h-3 rounded-full ${
                          exam.csvUploads[subject as keyof typeof exam.csvUploads]
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                        title={`${subject} - ${
                          exam.csvUploads[subject as keyof typeof exam.csvUploads]
                            ? 'Uploaded'
                            : 'Not uploaded'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {examSets.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={onManageExams}>
                  View All Exam Sets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State for New Users */}
      {totalExamSets === 0 && (
        <Card className="text-center p-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first exam set to begin tracking student performance and generating insights.
          </p>
          <Button onClick={onCreateExam} size="lg" className="mx-auto">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Exam Set
          </Button>
        </Card>
      )}
    </div>
  );
};
