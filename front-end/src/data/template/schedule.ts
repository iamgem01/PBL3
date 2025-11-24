// src/data/template/schedule.ts
import type { Template } from './type';

export const scheduleTemplates: Template[] = [
  {
    id: 'template_schedule_weekly',
    name: 'Thời Khóa Biểu Tuần',
    category: 'education',
    icon: '📅',
    description: 'Lịch học hoặc làm việc trong tuần',
    tags: ['schedule', 'timetable', 'weekly'],
    content: `<div class="template-content">
  <h1>📅 Thời khóa biểu tuần</h1>
  <p><strong>Tuần:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>

  <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f0f0f0;">
        <th>Giờ</th>
        <th>Thứ 2</th>
        <th>Thứ 3</th>
        <th>Thứ 4</th>
        <th>Thứ 5</th>
        <th>Thứ 6</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>8:00 - 9:30</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td><strong>9:45 - 11:15</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr style="background: #fff9e6;">
        <td colspan="6" style="text-align:center;"><strong>🍽️ Nghỉ trưa</strong></td>
      </tr>
      <tr>
        <td><strong>13:00 - 14:30</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td><strong>14:45 - 16:15</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td><strong>16:30 - 18:00</strong></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h2>📝 Ghi chú</h2>
  <ul>
    <li><strong>Phòng học:</strong> ...</li>
    <li><strong>Giảng viên:</strong> ...</li>
    <li><strong>Tài liệu cần chuẩn bị:</strong> ...</li>
  </ul>
</div>`
  },
  {
    id: 'template_schedule_daily',
    name: 'Lịch Trình Ngày',
    category: 'productivity',
    icon: '🗓️',
    description: 'Lập lịch chi tiết cho một ngày',
    tags: ['schedule', 'daily', 'planning'],
    content: `<div class="template-content">
  <h1>🗓️ Lịch trình ngày ${new Date().toLocaleDateString('vi-VN')}</h1>

  <h2>🌅 Buổi sáng (6:00 - 12:00)</h2>
  <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse;">
    <tr>
      <td><strong>6:00 - 7:00</strong></td>
      <td>🏃 Thể dục / Buổi sáng</td>
    </tr>
    <tr>
      <td><strong>7:00 - 8:00</strong></td>
      <td>🍳 Ăn sáng & chuẩn bị</td>
    </tr>
    <tr>
      <td><strong>8:00 - 10:00</strong></td>
      <td>💼 Deep work session 1</td>
    </tr>
    <tr>
      <td><strong>10:00 - 10:15</strong></td>
      <td>☕ Break</td>
    </tr>
    <tr>
      <td><strong>10:15 - 12:00</strong></td>
      <td>💼 Deep work session 2</td>
    </tr>
  </table>

  <h2>☀️ Buổi chiều (12:00 - 18:00)</h2>
  <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse;">
    <tr>
      <td><strong>12:00 - 13:00</strong></td>
      <td>🍽️ Ăn trưa & nghỉ ngơi</td>
    </tr>
    <tr>
      <td><strong>13:00 - 15:00</strong></td>
      <td>📧 Email, meetings, tasks</td>
    </tr>
    <tr>
      <td><strong>15:00 - 15:15</strong></td>
      <td>☕ Break</td>
    </tr>
    <tr>
      <td><strong>15:15 - 17:00</strong></td>
      <td>💼 Project work</td>
    </tr>
    <tr>
      <td><strong>17:00 - 18:00</strong></td>
      <td>📊 Review & planning tomorrow</td>
    </tr>
  </table>

  <h2>🌙 Buổi tối (18:00 - 22:00)</h2>
  <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse;">
    <tr>
      <td><strong>18:00 - 19:00</strong></td>
      <td>🍴 Ăn tối</td>
    </tr>
    <tr>
      <td><strong>19:00 - 21:00</strong></td>
      <td>🎯 Personal time / hobbies</td>
    </tr>
    <tr>
      <td><strong>21:00 - 22:00</strong></td>
      <td>📖 Đọc sách / thư giãn</td>
    </tr>
    <tr>
      <td><strong>22:00</strong></td>
      <td>😴 Ngủ</td>
    </tr>
  </table>

  <h2>✅ Checklist</h2>
  <ul>
    <li>☐ Uống đủ 2L nước</li>
    <li>☐ Tập thể dục 30 phút</li>
    <li>☐ Hoàn thành task quan trọng</li>
    <li>☐ Review ngày trước khi ngủ</li>
  </ul>
</div>`
  },
  {
    id: 'template_schedule_exam',
    name: 'Lịch Ôn Thi',
    category: 'education',
    icon: '📚',
    description: 'Kế hoạch ôn tập cho kỳ thi',
    tags: ['exam', 'study', 'preparation'],
    content: `<div class="template-content">
  <h1>📚 Lịch ôn thi</h1>
  
  <h2>🎯 Thông tin kỳ thi</h2>
  <ul>
    <li><strong>Môn thi:</strong> ...</li>
    <li><strong>Ngày thi:</strong> DD/MM/YYYY</li>
    <li><strong>Thời gian còn lại:</strong> ___ ngày</li>
    <li><strong>Hình thức:</strong> Trắc nghiệm / Tự luận</li>
  </ul>

  <h2>📖 Nội dung cần ôn</h2>
  <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f0f0f0;">
        <th>Chủ đề</th>
        <th>Độ ưu tiên</th>
        <th>Trạng thái</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Chương 1: ...</td>
        <td>🔴 Cao</td>
        <td>☐ Chưa học</td>
        <td></td>
      </tr>
      <tr>
        <td>Chương 2: ...</td>
        <td>🟡 Trung bình</td>
        <td>☐ Chưa học</td>
        <td></td>
      </tr>
      <tr>
        <td>Chương 3: ...</td>
        <td>🟢 Thấp</td>
        <td>☐ Chưa học</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h2>📅 Kế hoạch theo tuần</h2>
  <h3>Tuần 1</h3>
  <ul>
    <li>☐ Ôn chương 1 + 2</li>
    <li>☐ Làm bài tập</li>
    <li>☐ Xem lại lý thuyết</li>
  </ul>

  <h3>Tuần 2</h3>
  <ul>
    <li>☐ Ôn chương 3 + 4</li>
    <li>☐ Làm đề thi thử</li>
  </ul>

  <h3>Tuần 3 (Tuần cuối)</h3>
  <ul>
    <li>☐ Review tất cả chương</li>
    <li>☐ Làm đề thi thử 2-3 đề</li>
    <li>☐ Ôn lại phần còn yếu</li>
  </ul>

  <h2>📝 Tài liệu tham khảo</h2>
  <ul>
    <li>Giáo trình: ...</li>
    <li>Slide bài giảng: ...</li>
    <li>Đề thi cũ: ...</li>
  </ul>

  <h2>💡 Ghi chú quan trọng</h2>
  <ul>
    <li>Công thức cần nhớ: ...</li>
    <li>Khái niệm quan trọng: ...</li>
    <li>Mẹo làm bài: ...</li>
  </ul>

  <hr>
  <p><em>💪 "Success is the sum of small efforts repeated day in and day out"</em></p>
</div>`
  }
];