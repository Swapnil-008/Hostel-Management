import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperadminAttendanceView = ({ studentName }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentName.trim()) {
      setAttendance([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching student:', studentName.trim());
        const studentsRes = await axios.get('http://localhost:5000/api/students', {
          params: { name: studentName.trim() },
        });
        console.log('Students response:', studentsRes.data);
        if (studentsRes.data.length === 0) {
          setError('No student found with that name');
          setAttendance([]);
          setLoading(false);
          return;
        }
        const studentId = studentsRes.data[0].id;
        console.log('Fetching attendance for ID:', studentId);
        const attendanceRes = await axios.get(`http://localhost:5000/api/attendance?student_id=${studentId}`);
        console.log('Attendance response:', attendanceRes.data);
        setAttendance(attendanceRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch attendance');
        console.error('Attendance error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentName]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6">Attendance for {studentName}</h3>
      {loading ? (
        <p className="text-center text-blue-900">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : attendance.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-3 rounded-tl-lg">Date</th>
                <th className="p-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="p-3">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No attendance records found for {studentName}.</p>
      )}
    </div>
  );
};

export default SuperadminAttendanceView;