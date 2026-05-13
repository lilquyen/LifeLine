import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssignmentCard } from '../../components/rescuer/AssignmentCard';
import { RequestDetail } from '../../components/rescuer/RequestDetail';
import { fetchMyAssignments, getConversationByRequest } from '../../services/rescuerApi';

const HISTORY_STATUSES = ['cancelled', 'completed'];

export default function RescuerAssignmentHistory() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssignments();
  }, []);

  const historyAssignments = useMemo(
    () => assignments.filter(assign => HISTORY_STATUSES.includes(assign.assignment_status)),
    [assignments]
  );

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetchMyAssignments();
      setAssignments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (requestId: number) => {
    try {
      const convRes = await getConversationByRequest(requestId);
      if (convRes.data.success) {
        navigate(`/rescuer/conversations/${convRes.data.data.id}`);
      } else {
        alert('Không thể mở hội thoại');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi mở chat');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử ca cứu hộ</h1>
        <p className="text-sm text-slate-500 mt-1">Các ca đã hủy hoặc đã hoàn thành được lưu riêng tại đây.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : historyAssignments.length === 0 ? (
          <div>Chưa có ca đã hủy hoặc hoàn thành</div>
        ) : (
          historyAssignments.map((assign) => (
            <AssignmentCard
              key={assign.assignment_id}
              assignment={assign}
              onMessage={handleMessage}
              onViewDetail={setSelectedRequestId}
              onAssignmentUpdate={loadAssignments}
            />
          ))
        )}
      </div>

      {selectedRequestId !== null && (
        <RequestDetail
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  );
}
