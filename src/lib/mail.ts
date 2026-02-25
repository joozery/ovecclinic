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
