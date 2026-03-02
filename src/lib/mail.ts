import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendNotificationEmail({
    to,
    teacherName,
    activityTitle,
    date,
    startTime,
    endTime,
    meetingLink,
    supervisorName,
    organizationName = "สำนักงานคณะกรรมการการอาชีวศึกษา",
}: {
    to: string;
    teacherName: string;
    activityTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingLink: string;
    supervisorName: string;
    organizationName?: string;
}) {
    const mailOptions = {
        from: `"${organizationName}" <${process.env.SMTP_FROM}>`,
        to,
        subject: `แจ้งกำหนดการรับการนิเทศในหัวข้อ ${activityTitle}`,
        text: `เรียน คุณครู ${teacherName},

ตามที่ท่านได้ลงทะเบียนรับการนิเทศในหัวข้อ ${activityTitle}
ขอแจ้งกำหนดการรับการนิเทศดังนี้ :

วันที่: ${date}
เวลา: ${startTime} - ${endTime} น.
ลิงก์สำหรับเข้าร่วม: ${meetingLink}
ผู้นิเทศ: ${supervisorName}

เพื่อให้การนิเทศ ในวันดังกล่าวเป็นไปอย่างราบรื่น รบกวนคุณครูเตรียมความพร้อมในส่วนของแผนการจัดการเรียนรู้ สื่อการสอน หรือเอกสารอื่นๆ ที่เกี่ยวข้องกับรายวิชาที่จะรับการนิเทศ

ขอแสดงความนับถือ,

${supervisorName}
${organizationName}
http://nitedx.vec.go.th`,
        html: `
            <div style="font-family: 'Sarabun', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 10px;">แจ้งกำหนดการรับการนิเทศ</h2>
                <p>เรียน คุณครู <strong>${teacherName}</strong>,</p>
                <p>ตามที่ท่านได้ลงทะเบียนรับการนิเทศในหัวข้อ <strong>${activityTitle}</strong><br/>
                ขอแจ้งกำหนดการรับการนิเทศดังนี้ :</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>วันที่:</strong> ${date}</p>
                    <p style="margin: 5px 0;"><strong>เวลา:</strong> ${startTime} - ${endTime} น.</p>
                    <p style="margin: 5px 0;"><strong>ลิงก์สำหรับเข้าร่วม:</strong> <a href="${meetingLink}" style="color: #1a237e;">${meetingLink}</a></p>
                    <p style="margin: 5px 0;"><strong>ผู้นิเทศ:</strong> ${supervisorName}</p>
                </div>
                
                <p>เพื่อให้การนิเทศ ในวันดังกล่าวเป็นไปอย่างราบรื่น รบกวนคุณครูเตรียมความพร้อมในส่วนของแผนการจัดการเรียนรู้ สื่อการสอน หรือเอกสารอื่นๆ ที่เกี่ยวข้องกับรายวิชาที่จะรับการนิเทศ</p>
                
                <div style="margin-top: 30px; border-top: 1px solid #eee; pt: 20px;">
                    <p style="margin: 5px 0;">ขอแสดงความนับถือ,</p>
                    <p style="margin: 5px 0; font-weight: bold;">${supervisorName}</p>
                    <p style="margin: 5px 0;">${organizationName}</p>
                    <p style="margin: 5px 0;"><a href="http://nitedx.vec.go.th" style="color: #1a237e;">http://nitedx.vec.go.th</a></p>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export async function sendWelcomeEmail({
    to,
    userName,
    organizationName = "สำนักงานคณะกรรมการการอาชีวศึกษา (OVEC)",
}: {
    to: string;
    userName: string;
    organizationName?: string;
}) {
    const mailOptions = {
        from: `"${organizationName}" <${process.env.SMTP_FROM}>`,
        to,
        subject: `ยินดีต้อนรับเข้าใช้งานระบบ ${organizationName}`,
        text: `เรียน คุณ ${userName},

ยินดีต้อนรับท่านเข้าใช้งานระบบนิเทศออนไลน์และบริหารจัดการเกียรติบัตรอิเล็กทรอนิกส์

ขณะนี้ท่านได้สมัครสมาชิกเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบเพื่อลงทะเบียนเข้ารับการนิเทศ และตรวจสอบเกียรติบัตรของท่านได้ที่เว็บบไซต์ของเรา

ขอแสดงความนับถือ,
ทีมงานผู้ดูแลระบบ
สำนักงานคณะกรรมการการอาชีวศึกษา
http://nitedx.vec.go.th`,
        html: `
            <div style="font-family: 'Sarabun', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fff;">
                <div style="text-align: center; padding-bottom: 20px;">
                     <h1 style="color: #1a237e; margin: 0;">ยินดีต้อนรับสู่ระบบนิเทศออนไลน์</h1>
                     <p style="color: #666; font-size: 14px;">สำนักงานคณะกรรมการการอาชีวศึกษา (OVEC)</p>
                </div>
                
                <p>เรียน คุณ <strong>${userName}</strong>,</p>
                <p>ยินดีต้อนรับท่านเข้าสู่ระบบนิเทศออนไลน์และบริหารจัดการเกียรติบัตรอิเล็กทรอนิกส์อย่างเป็นทางการ</p>
                
                <p>ขณะนี้บัญชีผู้ใช้งานของท่านพร้อมสำหรับเข้าใช้งานแล้ว ท่านสามารถดำเนินการดังนี้:</p>
                <ul style="color: #555;">
                    <li>เลือกหัวข้อและลงทะเบียนเข้ารับการนิเทศที่สนใจ</li>
                    <li>ส่งผลงานและหลักฐานการเรียนรู้</li>
                    <li>ตรวจสอบและดาวน์โหลดเกียรติบัตรที่ได้รับการอนุมัติ</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://nitedx.vec.go.th" style="background-color: #1a237e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">เข้าสู่เว็บไซต์</a>
                </div>
                
                <p>หากมีข้อสงสัยประการใด สามารถติดต่อสอบถามได้ที่หน่วยงานต้นสังกัดของท่าน</p>
                
                <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; color: #777;">
                    <p style="margin: 5px 0;">ขอแสดงความนับถือ,</p>
                    <p style="margin: 5px 0; font-weight: bold; color: #333;">ทีมงานผู้ดูแลระบบ</p>
                    <p style="margin: 5px 0;">สำนักงานคณะกรรมการการอาชีวศึกษา</p>
                    <p style="margin: 5px 0;"><a href="http://nitedx.vec.go.th" style="color: #1a237e;">http://nitedx.vec.go.th</a></p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
}

export async function sendOTPEmail({
    to,
    otp,
}: {
    to: string;
    otp: string;
}) {
    const mailOptions = {
        from: `"ระบบยืนยันตัวตน (NitedX)" <${process.env.SMTP_FROM}>`,
        to,
        subject: `รหัสผ่านแบบใช้ครั้งเดียว (OTP) ของคุณคือ ${otp}`,
        text: `รหัสผ่านแบบใช้ครั้งเดียว (OTP) ของคุณคือ: ${otp}\nรหัสนี้จะหมดอายุใน 5 นาที\nโปรดอย่าเปิดเผยรหัสนี้แก่ผู้อื่น`,
        html: `
            <div style="font-family: 'Sarabun', sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; padding: 30px; border-radius: 12px; background-color: #fff; text-align: center;">
                <h2 style="color: #1a237e; margin-bottom: 20px;">ยืนยันอีเมลของคุณ</h2>
                <p style="font-size: 16px; color: #555;">รหัสผ่านแบบใช้ครั้งเดียว (OTP) ของคุณคือ:</p>
                <div style="font-size: 32px; font-weight: bold; color: #1a237e; letter-spacing: 5px; margin: 20px 0; background-color: #f5f7ff; padding: 15px; border-radius: 8px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #777;">รหัสนี้จะหมดอายุใน <strong>5 นาที</strong></p>
                <p style="font-size: 12px; color: #999; margin-top: 30px;">โปรดอย่าเปิดเผยรหัสนี้แก่ผู้อื่น หากคุณไม่ได้ดำเนินการนี้โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
}
