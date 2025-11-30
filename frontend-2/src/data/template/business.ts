// src/data/template/business.ts
import type { Template } from './type';

export const businessTemplates: Template[] = [
  {
    id: 'template_meeting_notes',
    name: 'Biên Bản Họp',
    category: 'business',
    icon: '📋',
    description: 'Ghi chép nội dung cuộc họp',
    tags: ['meeting', 'notes', 'business'],
    content: `<div class="template-content">
  <h1>📋 Biên bản họp</h1>
  
  <h2>📌 Thông tin cuộc họp</h2>
  <ul>
    <li><strong>Tiêu đề:</strong> ...</li>
    <li><strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</li>
    <li><strong>Thời gian:</strong> HH:MM - HH:MM</li>
    <li><strong>Địa điểm:</strong> ...</li>
    <li><strong>Chủ trì:</strong> ...</li>
  </ul>

  <h2>👥 Người tham dự</h2>
  <ul>
    <li>✅ Tên người 1 - Chức vụ</li>
    <li>✅ Tên người 2 - Chức vụ</li>
    <li>❌ Vắng mặt: ...</li>
  </ul>

  <h2>📝 Nội dung chính</h2>
  <h3>1. Mục đích cuộc họp</h3>
  <p>...</p>

  <h3>2. Các vấn đề được thảo luận</h3>
  <ul>
    <li><strong>Vấn đề 1:</strong> Mô tả ngắn gọn...</li>
    <li><strong>Vấn đề 2:</strong> ...</li>
  </ul>

  <h3>3. Quyết định đã đưa ra</h3>
  <ol>
    <li>Quyết định 1</li>
    <li>Quyết định 2</li>
  </ol>

  <h2>✅ Nhiệm vụ và phân công</h2>
  <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f0f0f0;">
        <th>Nhiệm vụ</th>
        <th>Người phụ trách</th>
        <th>Deadline</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Task 1</td>
        <td>Tên người</td>
        <td>DD/MM</td>
        <td>🟡 In Progress</td>
      </tr>
      <tr>
        <td>Task 2</td>
        <td>Tên người</td>
        <td>DD/MM</td>
        <td>⚪ Not Started</td>
      </tr>
    </tbody>
  </table>

  <h2>📅 Cuộc họp tiếp theo</h2>
  <ul>
    <li><strong>Ngày:</strong> DD/MM/YYYY</li>
    <li><strong>Nội dung:</strong> ...</li>
  </ul>

  <h2>💡 Ghi chú thêm</h2>
  <p>...</p>

  <hr>
  <p><em>Biên bản được lập bởi: _____ | Ký xác nhận: _____</em></p>
</div>`
  },
  {
    id: 'template_business_plan',
    name: 'Kế Hoạch Kinh Doanh',
    category: 'business',
    icon: '💼',
    description: 'Outline cho kế hoạch kinh doanh',
    tags: ['business', 'plan', 'startup'],
    content: `<div class="template-content">
  <h1>💼 Kế hoạch kinh doanh</h1>

  <h2>📋 Tóm tắt điều hành</h2>
  <p><strong>Tên doanh nghiệp:</strong> ...</p>
  <p><strong>Ngành:</strong> ...</p>
  <p><strong>Tầm nhìn:</strong> ...</p>
  <p><strong>Sứ mệnh:</strong> ...</p>

  <h2>🎯 Sản phẩm / Dịch vụ</h2>
  <p><strong>Mô tả:</strong> ...</p>
  <p><strong>Giá trị cốt lõi:</strong> ...</p>
  <p><strong>Điểm khác biệt:</strong> ...</p>

  <h2>📊 Phân tích thị trường</h2>
  <h3>Thị trường mục tiêu</h3>
  <ul>
    <li><strong>Quy mô:</strong> ...</li>
    <li><strong>Xu hướng:</strong> ...</li>
    <li><strong>Khách hàng mục tiêu:</strong> ...</li>
  </ul>

  <h3>Đối thủ cạnh tranh</h3>
  <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
    <tr>
      <th>Đối thủ</th>
      <th>Điểm mạnh</th>
      <th>Điểm yếu</th>
    </tr>
    <tr>
      <td>Đối thủ 1</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </table>

  <h2>📈 Chiến lược Marketing</h2>
  <ul>
    <li><strong>Định vị:</strong> ...</li>
    <li><strong>Kênh phân phối:</strong> ...</li>
    <li><strong>Chiến lược giá:</strong> ...</li>
    <li><strong>Quảng cáo:</strong> ...</li>
  </ul>

  <h2>👥 Đội ngũ</h2>
  <ul>
    <li><strong>Founder:</strong> ...</li>
    <li><strong>Key members:</strong> ...</li>
  </ul>

  <h2>💰 Kế hoạch tài chính</h2>
  <h3>Dự báo doanh thu (3 năm)</h3>
  <ul>
    <li>Năm 1: _____ VNĐ</li>
    <li>Năm 2: _____ VNĐ</li>
    <li>Năm 3: _____ VNĐ</li>
  </ul>

  <h3>Chi phí khởi nghiệp</h3>
  <ul>
    <li>Vốn ban đầu: _____ VNĐ</li>
    <li>Chi phí vận hành/tháng: _____ VNĐ</li>
  </ul>

  <h2>🎯 Mục tiêu và Milestones</h2>
  <table border="1" cellpadding="8" style="width:100%; border-collapse: collapse;">
    <tr>
      <th>Thời gian</th>
      <th>Mục tiêu</th>
      <th>KPI</th>
    </tr>
    <tr>
      <td>Tháng 1-3</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>Tháng 4-6</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </table>

  <h2>⚠️ Rủi ro và Giải pháp</h2>
  <ul>
    <li><strong>Rủi ro 1:</strong> ... → <em>Giải pháp:</em> ...</li>
    <li><strong>Rủi ro 2:</strong> ... → <em>Giải pháp:</em> ...</li>
  </ul>
</div>`
  },
  {
    id: 'template_swot_analysis',
    name: 'Phân Tích SWOT',
    category: 'business',
    icon: '🔍',
    description: 'Phân tích điểm mạnh, yếu, cơ hội, thách thức',
    tags: ['analysis', 'strategy', 'swot'],
    content: `<div class="template-content">
  <h1>🔍 Phân tích SWOT</h1>
  <p><strong>Chủ đề:</strong> [Tên dự án / sản phẩm / công ty]</p>
  <p><strong>Ngày phân tích:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>

  <table border="1" cellpadding="15" style="width:100%; border-collapse: collapse;">
    <tr>
      <td colspan="2" style="background: #e3f2fd; text-align: center;">
        <h2 style="margin:0;">🏢 NỘI BỘ (Internal)</h2>
      </td>
    </tr>
    <tr>
      <td style="width:50%; vertical-align:top;">
        <h3>💪 ĐIỂM MẠNH (Strengths)</h3>
        <ul>
          <li>Điểm mạnh 1</li>
          <li>Điểm mạnh 2</li>
          <li>Điểm mạnh 3</li>
          <li>...</li>
        </ul>
      </td>
      <td style="width:50%; vertical-align:top;">
        <h3>⚠️ ĐIỂM YẾU (Weaknesses)</h3>
        <ul>
          <li>Điểm yếu 1</li>
          <li>Điểm yếu 2</li>
          <li>Điểm yếu 3</li>
          <li>...</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="background: #f3e5f5; text-align: center;">
        <h2 style="margin:0;">🌍 BÊN NGOÀI (External)</h2>
      </td>
    </tr>
    <tr>
      <td style="vertical-align:top;">
        <h3>🚀 CƠ HỘI (Opportunities)</h3>
        <ul>
          <li>Cơ hội 1</li>
          <li>Cơ hội 2</li>
          <li>Cơ hội 3</li>
          <li>...</li>
        </ul>
      </td>
      <td style="vertical-align:top;">
        <h3>⚡ THÁCH THỨC (Threats)</h3>
        <ul>
          <li>Thách thức 1</li>
          <li>Thách thức 2</li>
          <li>Thách thức 3</li>
          <li>...</li>
        </ul>
      </td>
    </tr>
  </table>

  <h2>📊 Phân tích và Kế hoạch hành động</h2>
  
  <h3>🎯 Tận dụng điểm mạnh để nắm bắt cơ hội</h3>
  <ul>
    <li>Chiến lược 1: ...</li>
    <li>Chiến lược 2: ...</li>
  </ul>

  <h3>🛡️ Khắc phục điểm yếu</h3>
  <ul>
    <li>Hành động 1: ...</li>
    <li>Hành động 2: ...</li>
  </ul>

  <h3>⚔️ Đối phó với thách thức</h3>
  <ul>
    <li>Giải pháp 1: ...</li>
    <li>Giải pháp 2: ...</li>
  </ul>

  <h2>✅ Kết luận</h2>
  <p><strong>Đánh giá tổng thể:</strong> ...</p>
  <p><strong>Ưu tiên hành động:</strong> ...</p>
  <p><strong>Timeline:</strong> ...</p>
</div>`
  }
];