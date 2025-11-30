// src/data/template/journal.ts
import type { Template } from './type';

export const journalTemplates: Template[] = [
  {
    id: 'template_journal_daily',
    name: 'Nhật Ký Hàng Ngày',
    category: 'personal',
    icon: '📔',
    description: 'Ghi chép cảm xúc và suy nghĩ mỗi ngày',
    tags: ['journal', 'diary', 'daily'],
    content: `<div class="template-content">
  <h1>📔 Nhật ký - ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h1>
  
  <h2>🌅 Buổi sáng</h2>
  <p><strong>Tâm trạng:</strong> 😊 / 😐 / 😔</p>
  <p>Hôm nay tôi thức dậy với cảm giác...</p>
  <p><strong>Mục tiêu hôm nay:</strong></p>
  <ul>
    <li>Mục tiêu 1</li>
    <li>Mục tiêu 2</li>
  </ul>

  <h2>☀️ Trong ngày</h2>
  <p><strong>Điều tốt đẹp nhất hôm nay:</strong></p>
  <p>...</p>
  
  <p><strong>Thách thức gặp phải:</strong></p>
  <p>...</p>

  <p><strong>Người tôi gặp:</strong></p>
  <p>...</p>

  <h2>🌙 Buổi tối - Suy ngẫm</h2>
  <p><strong>Bài học hôm nay:</strong></p>
  <p>...</p>

  <p><strong>Biết ơn điều gì:</strong></p>
  <ul>
    <li>Điều 1</li>
    <li>Điều 2</li>
    <li>Điều 3</li>
  </ul>

  <p><strong>Ngày mai tôi sẽ:</strong></p>
  <p>...</p>

  <hr>
  <p><em>💭 "Mỗi ngày là một trang mới trong cuốn sách cuộc đời"</em></p>
</div>`
  },
  {
    id: 'template_journal_gratitude',
    name: 'Nhật Ký Biết Ơn',
    category: 'personal',
    icon: '🙏',
    description: 'Ghi lại những điều biết ơn mỗi ngày',
    tags: ['gratitude', 'positive', 'mindfulness'],
    content: `<div class="template-content">
  <h1>🙏 Nhật ký biết ơn</h1>
  <p><strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>

  <h2>✨ 3 điều tôi biết ơn hôm nay</h2>
  <ol>
    <li><strong>Điều 1:</strong> ...</li>
    <li><strong>Điều 2:</strong> ...</li>
    <li><strong>Điều 3:</strong> ...</li>
  </ol>

  <h2>💝 Người tôi muốn cảm ơn</h2>
  <p><strong>Tên:</strong> ...</p>
  <p><strong>Vì điều gì:</strong> ...</p>

  <h2>🌟 Khoảnh khắc đẹp nhất</h2>
  <p>Mô tả khoảnh khắc đặc biệt nhất trong ngày...</p>

  <h2>🎁 Điều tốt đẹp bất ngờ</h2>
  <p>Có điều gì bất ngờ và tuyệt vời xảy ra không?</p>

  <h2>💪 Thành tựu nhỏ</h2>
  <p>Điều gì tôi tự hào về bản thân hôm nay...</p>

  <hr>
  <blockquote>
    <p><em>"Gratitude turns what we have into enough" - Anonymous</em></p>
  </blockquote>
</div>`
  },
  {
    id: 'template_journal_reflection',
    name: 'Nhật Ký Suy Ngẫm Tuần',
    category: 'personal',
    icon: '🤔',
    description: 'Review và suy ngẫm về tuần đã qua',
    tags: ['reflection', 'weekly', 'review'],
    content: `<div class="template-content">
  <h1>🤔 Suy ngẫm tuần - ${new Date().toLocaleDateString('vi-VN')}</h1>

  <h2>📊 Tổng quan tuần</h2>
  <p><strong>Điểm tổng thể:</strong> ⭐⭐⭐⭐⭐ (1-5)</p>
  <p><strong>Tâm trạng chung:</strong> ...</p>

  <h2>🎯 Mục tiêu tuần trước</h2>
  <ul>
    <li>☑ Mục tiêu đã đạt 1</li>
    <li>☐ Mục tiêu chưa đạt 1</li>
  </ul>
  <p><strong>Tỷ lệ hoàn thành:</strong> ____%</p>

  <h2>🌟 Những điều tốt đẹp</h2>
  <ol>
    <li>Thành công 1</li>
    <li>Thành công 2</li>
    <li>Thành công 3</li>
  </ol>

  <h2>🚧 Thách thức & Cách giải quyết</h2>
  <p><strong>Thách thức:</strong> ...</p>
  <p><strong>Tôi đã giải quyết như thế nào:</strong> ...</p>
  <p><strong>Bài học:</strong> ...</p>

  <h2>📚 Học được gì mới</h2>
  <ul>
    <li>Kiến thức / kỹ năng 1</li>
    <li>Kiến thức / kỹ năng 2</li>
  </ul>

  <h2>👥 Mối quan hệ</h2>
  <p><strong>Người tôi đã kết nối:</strong> ...</p>
  <p><strong>Mối quan hệ cần cải thiện:</strong> ...</p>

  <h2>💪 Phát triển bản thân</h2>
  <p><strong>Thói quen tốt đã duy trì:</strong> ...</p>
  <p><strong>Điều cần cải thiện:</strong> ...</p>

  <h2>🎯 Kế hoạch tuần tới</h2>
  <ol>
    <li>Mục tiêu 1</li>
    <li>Mục tiêu 2</li>
    <li>Mục tiêu 3</li>
  </ol>

  <h2>💭 Suy ngẫm cuối cùng</h2>
  <p>Những suy nghĩ, cảm nhận về tuần vừa qua...</p>
</div>`
  }
];