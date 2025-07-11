
import React, { useState } from 'react';
import { CSVUpload } from '@/components/CSVUpload';
import { DataTable } from '@/components/DataTable';
import { Dashboard } from '@/components/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BarChart3, Users, FileSpreadsheet } from 'lucide-react';

const Index = () => {
  const [studentData, setStudentData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'dashboard'>('upload');

  const handleDataUpload = (data: any[]) => {
    setStudentData(data);
    setActiveTab('dashboard');
  };

  const resetData = () => {
    setStudentData([]);
    setActiveTab('upload');
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
            
            {studentData.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {studentData.length} Students
                </div>
                <button
                  onClick={resetData}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Upload New Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {studentData.length === 0 ? (
          /* Welcome & Upload State */
          <div className="space-y-8">
            {/* Welcome Section */}
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

            {/* Features */}
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
                  <CardTitle className="text-lg">Student Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Identify top performers and students needing additional support with detailed breakdowns.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Upload Component */}
            <CSVUpload onDataUpload={handleDataUpload} />
          </div>
        ) : (
          /* Data Loaded State */
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
            {activeTab === 'preview' && <DataTable data={studentData} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
