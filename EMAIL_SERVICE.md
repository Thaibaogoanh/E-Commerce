# 📧 Email Service Documentation

## Tổng quan

Email Service sử dụng **Nodemailer** để gửi email và **Handlebars** để render templates. Templates được lưu trong `src/templates/emails/` và được load động khi cần.

---

## ❓ Tại sao Templates ở Backend?

### 1. **Server-side Rendering**
- Email được gửi từ **server**, không phải từ browser
- Backend cần render templates với dữ liệu động (order info, user data, etc.)
- Front-end chỉ là UI cho người dùng, không liên quan đến việc gửi email

### 2. **Bảo mật**
- Email chứa thông tin nhạy cảm (order details, payment info)
- Nếu đặt trong front-end, người dùng có thể xem/modify code
- Backend đảm bảo tính bảo mật và toàn vẹn dữ liệu

### 3. **Tách biệt trách nhiệm**
- **Front-end**: UI components, user interaction
- **Backend**: Business logic, email sending, data processing

### 4. **Email Client Compatibility**
- Email HTML cần inline CSS và cấu trúc đặc biệt
- Khác với web HTML (không thể dùng external CSS, JavaScript)
- Cần tối ưu cho các email clients (Gmail, Outlook, Apple Mail, etc.)

---

## 📁 Cấu trúc Templates

```
retail-store-nestjs/src/templates/emails/
├── order-confirmation.html    # Email xác nhận đơn hàng (HTML)
├── order-confirmation.txt     # Email xác nhận đơn hàng (Text fallback)
├── shipping-notification.html # Thông báo gửi hàng (HTML)
├── shipping-notification.txt  # Thông báo gửi hàng (Text)
├── password-reset.html        # Reset password (HTML)
└── welcome.html               # Chào mừng user mới (HTML)
```

### Template Format

Templates sử dụng **Handlebars** syntax:

```html
<!-- Ví dụ: order-confirmation.html -->
<h1>Xác nhận đơn hàng #{{orderId}}</h1>
<p>Ngày đặt: {{orderDate}}</p>

{{#each items}}
  <p>{{index}}. {{productName}} - {{quantity}}x</p>
{{/each}}

<p>Tổng cộng: {{totalAmount}}₫</p>
```

---

## 🔧 Cách hoạt động

### 1. Template Loading

```typescript
// EmailService tự động load templates từ files
private loadTemplate(templateName: string, extension: 'html' | 'txt'): HandlebarsTemplateDelegate {
  const templatePath = path.join(this.templatesPath, `${templateName}.${extension}`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = Handlebars.compile(templateContent);
  return compiledTemplate;
}
```

### 2. Template Caching

- Templates được compile và cache trong memory
- Chỉ load lại khi server restart
- Hiệu suất cao, không cần đọc file mỗi lần gửi email

### 3. Context Injection

```typescript
// Dữ liệu được inject vào template
const context = {
  orderId: '12345',
  orderDate: '01/01/2024',
  items: [
    { index: 1, productName: 'Áo thun', quantity: 2, price: '200,000' }
  ],
  totalAmount: '400,000'
};

const html = template(context); // Render với dữ liệu
```

---

## 📝 Sử dụng Email Service

### 1. Gửi Email Xác Nhận Đơn Hàng

```typescript
// Trong orders.service.ts
await this.emailService.sendOrderConfirmation(userEmail, {
  id: order.id,
  orderId: order.id,
  totalAmount: order.totalAmount,
  items: orderItems.map(item => ({
    productName: item.product.name,
    quantity: item.qty,
    price: item.unit_price,
    colorCode: item.colorCode,
    sizeCode: item.sizeCode,
  })),
  shippingAddress: order.shippingAddress,
  paymentMethod: order.paymentMethod,
  orderDate: order.createdAt.toLocaleDateString('vi-VN'),
});
```

### 2. Gửi Email Thông Báo Gửi Hàng

```typescript
await this.emailService.sendShippingNotification(userEmail, {
  orderId: order.id,
  trackingNumber: shipment.trackingNumber,
  carrier: shipment.carrier,
});
```

### 3. Gửi Email Reset Password

```typescript
await this.emailService.sendPasswordReset(userEmail, resetToken);
```

### 4. Gửi Email Chào Mừng

```typescript
await this.emailService.sendWelcomeEmail(userEmail, userName);
```

---

## ⚙️ Cấu hình SMTP

### 1. Thêm vào `.env`

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sustainique.com

# Frontend URL (cho links trong email)
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail Setup

1. Bật **2-Step Verification** trong Google Account
2. Tạo **App Password**: https://myaccount.google.com/apppasswords
3. Copy App Password vào `SMTP_PASS`

**Lưu ý**: Không dùng mật khẩu thường, chỉ dùng App Password!

### 3. Các SMTP Providers khác

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

---

## 🎨 Chỉnh sửa Templates

### 1. Mở file template

```bash
# Ví dụ: chỉnh sửa order confirmation
code retail-store-nestjs/src/templates/emails/order-confirmation.html
```

### 2. Chỉnh sửa HTML/CSS

- Sử dụng **inline CSS** (không thể dùng external CSS)
- Test trên nhiều email clients (Gmail, Outlook, Apple Mail)
- Sử dụng table-based layout cho compatibility tốt hơn

### 3. Handlebars Syntax

```handlebars
<!-- Variables -->
{{orderId}}
{{orderDate}}

<!-- Conditionals -->
{{#if colorCode}}
  <p>Màu: {{colorCode}}</p>
{{/if}}

<!-- Loops -->
{{#each items}}
  <p>{{index}}. {{productName}}</p>
{{/each}}

<!-- Helpers (custom) -->
{{formatCurrency totalAmount}}
{{formatDate orderDate}}
```

### 4. Restart Backend

```bash
# Templates được cache, cần restart để load lại
npm run start:dev
```

---

## 🐛 Troubleshooting

### Email không gửi được?

1. **Kiểm tra SMTP credentials**
   ```bash
   # Xem logs trong console
   [EmailService] Email service initialized with SMTP
   ```

2. **Gmail: App Password**
   - Đảm bảo đã bật 2FA
   - Tạo App Password mới
   - Copy vào `SMTP_PASS`

3. **Firewall/Network**
   - Kiểm tra firewall không block port 587
   - Thử dùng port 465 với `SMTP_SECURE=true`

4. **Email Service không configured**
   - Service sẽ log warning nhưng không throw error
   - Email sending là **non-blocking** (không ảnh hưởng order processing)

### Template không load được?

1. **Kiểm tra đường dẫn**
   ```typescript
   // Templates phải ở: src/templates/emails/
   ```

2. **Kiểm tra file tồn tại**
   ```bash
   ls retail-store-nestjs/src/templates/emails/
   ```

3. **Kiểm tra syntax Handlebars**
   - Xem logs: `Failed to load template`
   - Validate Handlebars syntax

### Email hiển thị sai format?

1. **Inline CSS**: Đảm bảo CSS được inline trong HTML
2. **Table-based layout**: Sử dụng `<table>` thay vì `<div>` cho layout
3. **Test trên nhiều clients**: Gmail, Outlook, Apple Mail
4. **Email testing tools**: 
   - [Litmus](https://litmus.com/)
   - [Email on Acid](https://www.emailonacid.com/)

---

## 📚 Tài liệu tham khảo

- [Nodemailer Documentation](https://nodemailer.com/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Can I Email](https://www.caniemail.com/) - Email client compatibility

---

## 🔄 Best Practices

1. **Always provide text version**: Tạo `.txt` version cho mỗi email
2. **Test before production**: Test trên nhiều email clients
3. **Error handling**: Email sending không nên block main flow
4. **Template caching**: Templates được cache để tăng performance
5. **Responsive design**: Email templates nên responsive cho mobile

---

**Happy emailing! 📧**

