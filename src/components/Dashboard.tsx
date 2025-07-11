
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Award, AlertTriangle, BookOpen } from 'lucide-react';

interface DashboardProps {
  data: any[];
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const gradeColumns = headers.filter(header => {
      const lower = header.toLowerCase();
      return lower.includes('grade') || 
             lower.includes('score') || 
             lower.includes('math') || 
             lower.includes('science') || 
             lower.includes('english') || 
             lower.includes('history') || 
             lower.includes('physics') || 
             lower.includes('chemistry') ||
             lower.includes('biology') ||
             !isNaN(Number(data[0][header]));
    });

    // Calculate overall statistics
    const totalStudents = data.length;
    let totalGrades = 0;
    let gradeCount = 0;

    data.forEach(student => {
      gradeColumns.forEach(col => {
        const grade = parseFloat(student[col]);
        if (!isNaN(grade) && grade >= 0 && grade <= 100) {
          totalGrades += grade;
          gradeCount++;
        }
      });
    });

    const averageGrade = gradeCount > 0 ? totalGrades / gradeCount : 0;

    // Grade distribution
    const gradeRanges = [
      { range: 'A (90-100)', min: 90, max: 100, count: 0 },
      { range: 'B (80-89)', min: 80, max: 89, count: 0 },
      { range: 'C (70-79)', min: 70, max: 79, count: 0 },
      { range: 'D (60-69)', min: 60, max: 69, count: 0 },
      { range: 'F (0-59)', min: 0, max: 59, count: 0 }
    ];

    data.forEach(student => {
      gradeColumns.forEach(col => {
        const grade = parseFloat(student[col]);
        if (!isNaN(grade)) {
          gradeRanges.forEach(range => {
            if (grade >= range.min && grade <= range.max) {
              range.count++;
            }
          });
        }
      });
    });

    // Subject performance
    const subjectPerformance = gradeColumns.map(subject => {
      const grades = data.map(student => parseFloat(student[subject])).filter(g => !isNaN(g));
      const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      return {
        subject: subject.replace(/_/g, ' ').toUpperCase(),
        average: Math.round(average * 100) / 100,
        students: grades.length
      };
    }).filter(s => s.students > 0);

    // Top and struggling students
    const studentAverages = data.map(student => {
      const grades = gradeColumns.map(col => parseFloat(student[col])).filter(g => !isNaN(g));
      const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      
      const nameField = headers.find(h => h.toLowerCase().includes('name')) || headers[0];
      
      return {
        name: student[nameField] || 'Unknown',
        average: Math.round(average * 100) / 100,
        gradesCount: grades.length
      };
    }).filter(s => s.gradesCount > 0);

    const topStudents = studentAverages
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);

    const strugglingStudents = studentAverages
      .filter(s => s.average < 70)
      .sort((a, b) => a.average - b.average)
      .slice(0, 5);

    return {
      totalStudents,
      averageGrade: Math.round(averageGrade * 100) / 100,
      gradeDistribution: gradeRanges.filter(r => r.count > 0),
      subjectPerformance,
      topStudents,
      strugglingStudents,
      passRate: Math.round((studentAverages.filter(s => s.average >= 60).length / studentAverages.length) * 100)
    };
  }, [data]);

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageGrade}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.passRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Struggling Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.strugglingStudents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Distribution of grades across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest averages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{student.average}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students Needing Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Students Needing Support
            </CardTitle>
            <CardDescription>Students with averages below 70%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.strugglingStudents.length > 0 ? (
                analytics.strugglingStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-medium">
                        !
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{student.average}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Great news! All students are performing well.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
