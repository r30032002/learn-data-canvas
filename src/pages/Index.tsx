
import React, { useState } from 'react';
import { CSVUpload } from '@/components/CSVUpload';
import { DataTable } from '@/components/DataTable';
import { Dashboard } from '@/components/Dashboard';
import { StudentList } from '@/components/StudentList';
import { StudentDetail } from '@/components/StudentDetail';
import { AddStudent } from '@/components/AddStudent';
import { ExamManager } from '@/components/ExamManager';
import { ExamCSVUpload } from '@/components/ExamCSVUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BarChart3, Users, FileSpreadsheet, UserPlus, Calendar } from 'lucide-react';

type ViewMode = 'upload' | 'preview' | 'dashboard' | 'students' | 'student-detail' | 'add-student' | 'exam-manager' | 'exam-upload';

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

const Index = () => {
  const [studentData, setStudentData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ViewMode>('exam-manager');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [selectedExamSet, setSelectedExamSet] = useState<ExamSet | null>(null);

  const handleDataUpload = (data: any[]) => {
    setStudentData(data);
    setActiveTab('dashboard');
  };

  const handleAddStudent = (newStudent: any) => {
    setStudentData(prev => [...prev, newStudent]);
    setActiveTab('students');
  };

  const resetData = () => {
    setStudentData([]);
    setSelectedStudent(null);
    setActiveTab('exam-manager');
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setActiveTab('student-detail');
  };

  const handleCreateExam = (examData: Omit<ExamSet, 'id' | 'csvUploads' | 'studentCount'>) => {
    const newExam: ExamSet = {
      ...examData,
      id: Date.now().toString(),
      csvUploads: {},
      studentCount: 0
    };
    setExamSets(prev => [...prev, newExam]);
  };

  const handleSelectExam = (examSet: ExamSet) => {
    setSelectedExamSet(examSet);
    setActiveTab('exam-upload');
  };

  const handleExamUploadComplete = (examId: string, subject: string, data: any[]) => {
    setExamSets(prev => prev.map(exam => {
      if (exam.id === examId) {
        const updatedExam = {
          ...exam,
          csvUploads: {
            ...exam.csvUploads,
            [subject]: data
          }
        };
        
        // Calculate total unique students
        const allStudentIds = new Set();
        Object.values(updatedExam.csvUploads).forEach(subjectData => {
          if (subjectData) {
            subjectData.forEach(row => {
              const studentId = row.student_id || row.Student_ID || row.id || row.ID;
              if (studentId) allStudentIds.add(studentId);
            });
          }
        });
        updatedExam.studentCount = allStudentIds.size;
        
        return updatedExam;
      }
      return exam;
    }));

    // Update selectedExamSet if it's the one being updated
    if (selectedExamSet?.id === examId) {
      setSelectedExamSet(prev => {
        if (!prev) return null;
        return {
          ...prev,
          csvUploads: {
            ...prev.csvUploads,
            [subject]: data
          },
          studentCount: prev.studentCount // Will be updated by the above logic
        };
      });
    }
  };

  const handleViewExamDashboard = () => {
    if (selectedExamSet) {
      // Combine all CSV data from the exam set
      const combinedData: any[] = [];
      Object.entries(selectedExamSet.csvUploads).forEach(([subject, data]) => {
        if (data) {
          data.forEach(row => {
            combinedData.push({
              ...row,
              subject: subject,
              examSet: selectedExamSet.name
            });
          });
        }
      });
      setStudentData(combinedData);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">Student Academic Analytics</p>
              </div>
            </div>
            
            {(studentData.length > 0 || examSets.length > 0) && (
              <div className="flex items-center gap-4">
                {studentData.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {studentData.length} Records
                  </div>
                )}
                <button
                  onClick={resetData}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Back to Exam Sets
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'exam-manager' && (
          <ExamManager
            examSets={examSets}
            onCreateExam={handleCreateExam}
            onSelectExam={handleSelectExam}
          />
        )}

        {activeTab === 'exam-upload' && selectedExamSet && (
          <ExamCSVUpload
            examSet={selectedExamSet}
            onUploadComplete={handleExamUploadComplete}
            onBack={() => setActiveTab('exam-manager')}
            onViewDashboard={handleViewExamDashboard}
          />
        )}

        {studentData.length === 0 && activeTab === 'upload' && (
          /* Legacy upload interface - keeping for backward compatibility */
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome to Your Teaching Dashboard
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform your student data into actionable insights. Upload CSV files containing student grades 
                and academic information to generate comprehensive analytics and visualizations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-green-600 mx-auto" />
                  <CardTitle className="text-lg">Easy Data Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Simply drag and drop your CSV files or browse to upload student academic data securely.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto" />
                  <CardTitle className="text-lg">Visual Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get instant insights with interactive charts showing grade distributions and performance trends.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-8 w-8 text-purple-600 mx-auto" />
                  <CardTitle className="text-lg">Student Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    View individual student profiles, track performance history, and add new students to your class.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <CSVUpload onDataUpload={handleDataUpload} />
          </div>
        )}

        {studentData.length > 0 && (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Analytics Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'students' || activeTab === 'student-detail'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Students
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 inline mr-2" />
                  Data Preview
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && <Dashboard data={studentData} />}
            {activeTab === 'students' && (
              <StudentList 
                data={studentData} 
                onStudentSelect={handleStudentSelect}
                onAddStudent={() => setActiveTab('add-student')}
              />
            )}
            {activeTab === 'student-detail' && selectedStudent && (
              <StudentDetail 
                student={selectedStudent} 
                onBack={() => setActiveTab('students')} 
              />
            )}
            {activeTab === 'add-student' && (
              <AddStudent 
                onAddStudent={handleAddStudent}
                onCancel={() => setActiveTab('students')}
                existingData={studentData}
              />
            )}
            {activeTab === 'preview' && <DataTable data={studentData} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
