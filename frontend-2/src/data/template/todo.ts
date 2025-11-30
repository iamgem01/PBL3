// src/data/template/todo.ts
import type { Template } from './type';

export const todoTemplates: Template[] = [
  {
    id: 'template_todo_basic',
    name: 'Todo List Cơ Bản',
    category: 'productivity',
    icon: '✅',
    description: 'Danh sách công việc đơn giản cho ngày',
    tags: ['task', 'daily', 'productivity'],
    content: `<div class="template-content">
  <h1>📋 Todo List - ${new Date().toLocaleDateString('vi-VN')}</h1>
  
  <h2>🎯 Ưu tiên cao</h2>
  <ul>
    <li>☐ Công việc quan trọng 1</li>
    <li>☐ Công việc quan trọng 2</li>
  </ul>

  <h2>📝 Công việc hôm nay</h2>
  <ul>
    <li>☐ Task 1</li>
    <li>☐ Task 2</li>
    <li>☐ Task 3</li>
  </ul>

  <h2>💭 Ý tưởng / Ghi chú</h2>
  <p>Viết những ý tưởng hoặc ghi chú nhanh ở đây...</p>

  <h2>✅ Hoàn thành</h2>
  <ul>
    <li>☑ Ví dụ task đã xong</li>
  </ul>

  <hr>
  <p><em>💡 Tips: Ưu tiên 3 việc quan trọng nhất mỗi ngày</em></p>
</div>`
  },
  {
    id: 'template_todo_weekly',
    name: 'Todo List Tuần',
    category: 'productivity',
    icon: '📅',
    description: 'Lập kế hoạch công việc cho cả tuần',
    tags: ['weekly', 'planning', 'productivity'],
    content: `<div class="template-content">
  <h1>📅 Kế hoạch tuần</h1>
  <p><strong>Tuần:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>

  <h2>🎯 Mục tiêu tuần này</h2>
  <ol>
    <li>Mục tiêu 1</li>
    <li>Mục tiêu 2</li>
    <li>Mục tiêu 3</li>
  </ol>

  <h2>📆 Thứ Hai</h2>
  <ul>
    <li>☐ Task 1</li>
    <li>☐ Task 2</li>
  </ul>

  <h2>📆 Thứ Ba</h2>
  <ul>
    <li>☐ Task 1</li>
  </ul>

  <h2>📆 Thứ Tư</h2>
  <ul>
    <li>☐ Task 1</li>
  </ul>

  <h2>📆 Thứ Năm</h2>
  <ul>
    <li>☐ Task 1</li>
  </ul>

  <h2>📆 Thứ Sáu</h2>
  <ul>
    <li>☐ Task 1</li>
  </ul>

  <h2>📆 Cuối tuần</h2>
  <ul>
    <li>☐ Hoạt động thư giãn</li>
  </ul>

  <hr>
  <h2>📊 Đánh giá cuối tuần</h2>
  <p><strong>Đã hoàn thành:</strong> ___ / ___</p>
  <p><strong>Bài học:</strong> ...</p>
</div>`
  },
  {
    id: 'template_todo_project',
    name: 'Quản Lý Dự Án',
    category: 'productivity',
    icon: '🎯',
    description: 'Template cho quản lý dự án và deadline',
    tags: ['project', 'deadline', 'team'],
    content: `<div class="template-content">
  <h1>🎯 [Tên Dự Án]</h1>
  
  <h2>📋 Thông tin dự án</h2>
  <ul>
    <li><strong>Deadline:</strong> DD/MM/YYYY</li>
    <li><strong>Team:</strong> Thành viên 1, 2, 3...</li>
    <li><strong>Trạng thái:</strong> 🟡 Đang thực hiện</li>
  </ul>

  <h2>🎯 Mục tiêu chính</h2>
  <ol>
    <li>Mục tiêu 1</li>
    <li>Mục tiêu 2</li>
  </ol>

  <h2>📝 Nhiệm vụ cần làm</h2>
  <h3>🔴 Ưu tiên cao</h3>
  <ul>
    <li>☐ Task urgent 1</li>
  </ul>

  <h3>🟡 Ưu tiên trung bình</h3>
  <ul>
    <li>☐ Task 1</li>
    <li>☐ Task 2</li>
  </ul>

  <h3>🟢 Ưu tiên thấp</h3>
  <ul>
    <li>☐ Task 1</li>
  </ul>

  <h2>✅ Đã hoàn thành</h2>
  <ul>
    <li>☑ Task example</li>
  </ul>

  <h2>📊 Tiến độ</h2>
  <p><strong>Hoàn thành:</strong> __% (__ / __ tasks)</p>

  <h2>🚧 Vấn đề cần giải quyết</h2>
  <ul>
    <li>Vấn đề 1</li>
  </ul>

  <h2>💡 Ghi chú</h2>
  <p>Các ghi chú quan trọng...</p>
</div>`
  }
];