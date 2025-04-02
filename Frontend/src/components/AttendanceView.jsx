import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaClipboardCheck } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AttendanceView = () => {
  // Memoize the user object to prevent re-fetching from localStorage on every render
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState({ studentId: '', date: '', status: 'Present' });
  const [loading, setLoading] = useState(true); // Add loading state
  const [lastFetchedMonth, setLastFetchedMonth] = useState(null); // Track the last fetched month
  const [lastFetchedYear, setLastFetchedYear] = useState(null); // Track the last fetched year

  // Debug log for component rendering
  console.log('AttendanceView rendered');

  // Debug log for month/year changes
  useEffect(() => {
    console.log('Selected month/year changed:', { selectedMonth, selectedYear });
  }, [selectedMonth, selectedYear]);

  // Memoized fetch function
  const fetchAttendance = useCallback(async () => {
    if (user && user.id && !user.username) { // Only for students
      // Only fetch if the month or year has changed
      if (selectedMonth !== lastFetchedMonth || selectedYear !== lastFetchedYear) {
        try {
          setLoading(true); // Set loading to true before fetching
          const res = await axios.get(`http://localhost:5000/api/attendance?student_id=${user.id}`);
          console.log('Fetched attendance:', res.data); // Debug log
          setAttendance(res.data);
          // Update the last fetched month and year
          setLastFetchedMonth(selectedMonth);
          setLastFetchedYear(selectedYear);
        } catch (err) {
          console.error('Error fetching attendance:', err);
          alert(err.response?.data?.error || 'Failed to fetch attendance');
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      } else {
        setLoading(false); // No need to fetch, just stop loading
      }
    } else {
      setLoading(false); // Ensure loading is false if not fetching
    }
  }, [user, selectedMonth, selectedYear, lastFetchedMonth, lastFetchedYear]);

  // Fetch attendance data on mount and when month or year changes
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]); // Only depend on fetchAttendance

  const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay(); // 0 (Sunday) to 6 (Saturday)
  };

  const renderCalendar = () => {
    const days = daysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const calendarDays = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= days; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendance.find((rec) => rec.date === dateStr);
      console.log(`Day ${day} (${dateStr}):`, record); // Debug log
      let bgColor = 'bg-gray-200'; // Default color for unrecorded days
      let tooltip = 'Not Recorded';
      if (record) {
        bgColor = record.status === 'Present' ? 'bg-green-500' : 'bg-red-500';
        tooltip = `Status: ${record.status}`;
      }
      calendarDays.push(
        <div
          key={day}
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-sm sm:text-base font-medium text-white ${bgColor} cursor-default relative group`}
        >
          {day}
          {/* Tooltip */}
          <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {tooltip}
          </span>
        </div>
      );
    }

    return calendarDays;
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/attendance/mark', {
        student_id: attendanceData.studentId,
        date: attendanceData.date,
        status: attendanceData.status,
      });
      alert('Attendance marked successfully');
      setAttendanceData({ studentId: '', date: '', status: 'Present' });
      // Refresh attendance data for the student if they are viewing their own calendar
      if (user && user.id && !user.username) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 bg-blue-50">
        <h2 className="section-title">Attendance</h2>
        <div className="max-w-4xl mx-auto">
          {user && user.username ? (
            // Admin View: Mark Attendance
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Mark Attendance</h3>
              <form onSubmit={handleMarkAttendance}>
                <div className="mb-4">
                  <label className="block text-blue-900 font-medium mb-2">Student ID</label>
                  <input
                    type="number"
                    value={attendanceData.studentId}
                    onChange={(e) => setAttendanceData({ ...attendanceData, studentId: e.target.value })}
                    className="input-field"
                    placeholder="Enter student ID"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-blue-900 font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={attendanceData.date}
                    onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-blue-900 font-medium mb-2">Status</label>
                  <select
                    value={attendanceData.status}
                    onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <button type="submit" className="button">
                  Mark Attendance
                </button>
              </form>
            </div>
          ) : (
            // Student View: View Attendance
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <FaClipboardCheck className="text-blue-900 text-3xl mr-2" />
                <h3 className="text-2xl font-bold text-blue-900">Your Attendance</h3>
              </div>
              <div className="mb-6 flex justify-center space-x-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="input-field"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="input-field"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {loading ? (
                <p className="text-center text-blue-900">Loading attendance...</p>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-3 text-center">
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Sun</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Mon</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Tue</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Wed</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Thu</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Fri</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">Sat</div>
                    {renderCalendar()}
                  </div>
                  {/* Legend */}
                  <div className="mt-6 flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-blue-900 text-sm">Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-blue-900 text-sm">Absent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span className="text-blue-900 text-sm">Not Recorded</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AttendanceView;