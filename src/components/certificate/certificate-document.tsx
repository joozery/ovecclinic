
"use client";

import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts for Thai support
Font.register({
    family: 'Noto Sans Thai',
    src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansThai/NotoSansThai-Regular.ttf',
});
Font.register({
    family: 'Noto Sans Thai Bold',
    src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansThai/NotoSansThai-Bold.ttf',
});

interface TextField {
    id: string;
    label: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight: string;
    color: string;
    align: string;
}

interface CertificateData {
    recipientName: string;
    courseTitle: string;
    completionDate: Date;
    certificateCode: string;
    issuerName?: string;
}

interface CertificateTemplate {
    backgroundImageUrl?: string;
    fields?: TextField[];
    signerName?: string;
    signerPosition?: string;
    orgName?: string;
}

// A4 Landscape: 841.89 x 595.28 pt
const PAGE_W = 841.89;
const PAGE_H = 595.28;

function getFieldValue(id: string, data: CertificateData): string {
    switch (id) {
        case 'recipientName': return data.recipientName;
        case 'courseTitle': return `"${data.courseTitle}"`;
        case 'completionDate': return `ให้ไว้ ณ วันที่ ${format(new Date(data.completionDate), 'd MMMM yyyy')}`;
        case 'certificateCode': return `เลขที่: ${data.certificateCode}`;
        default: return id;
    }
}

const s = StyleSheet.create({
    page: { fontFamily: 'Noto Sans Thai', position: 'relative' },
    bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fffdf9' },
    borderOuter: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: '2px solid #b8860b' },
    borderInner: { position: 'absolute', top: 30, left: 30, right: 30, bottom: 30, border: '1px solid #b8860b' },
    content: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 50,
    },
    header: { fontSize: 32, fontFamily: 'Noto Sans Thai Bold', color: '#1a237e', textAlign: 'center', marginBottom: 8 },
    subheader: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 },
    recipientLabel: { fontSize: 13, color: '#777', marginBottom: 8 },
    recipientName: {
        fontSize: 32, fontFamily: 'Noto Sans Thai Bold', color: '#000',
        textAlign: 'center', borderBottom: '1.5px solid #b8860b',
        minWidth: 400, paddingBottom: 5, marginBottom: 16,
    },
    courseTitle: { fontSize: 20, fontFamily: 'Noto Sans Thai Bold', color: '#1a237e', textAlign: 'center', marginBottom: 8 },
    dateText: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 32 },
    sigRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 60, marginTop: 'auto' },
    sigBlock: { alignItems: 'center', width: 220 },
    sigLine: { width: '100%', borderBottom: '1px solid #333', marginBottom: 6 },
    sigName: { fontSize: 12, fontFamily: 'Noto Sans Thai Bold', color: '#333' },
    sigRole: { fontSize: 10, color: '#777' },
    code: { position: 'absolute', bottom: 42, right: 45, fontSize: 9, color: '#b8860b', fontFamily: 'Noto Sans Thai Bold' },
    footer: { position: 'absolute', bottom: 42, left: 45, fontSize: 8, color: '#aaa' },
});

export const CertificateDocument = ({ data, template }: { data: CertificateData; template?: CertificateTemplate }) => {
    const hasBg = !!template?.backgroundImageUrl;
    const hasFields = !!(template?.fields && template.fields.length > 0);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const bgUrl = hasBg && template!.backgroundImageUrl!.startsWith('http')
        ? `${baseUrl}/api/proxy-image?url=${encodeURIComponent(template!.backgroundImageUrl!)}`
        : template?.backgroundImageUrl;

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={s.page}>

                {/* Background */}
                {hasBg ? (
                    <Image src={bgUrl!} style={s.bg} />
                ) : (
                    <>
                        <View style={s.bg} />
                        <View style={s.borderOuter} />
                        <View style={s.borderInner} />
                    </>
                )}

                {/* Custom positioned fields (template with background) */}
                {hasBg && hasFields && template!.fields!.map((field) => {
                    const x = (field.x / 100) * PAGE_W;
                    const y = (field.y / 100) * PAGE_H;
                    const isBold = field.fontWeight === 'bold';
                    const textWidth = 400;
                    const leftPos = field.align === 'center' ? x - textWidth / 2
                        : field.align === 'right' ? x - textWidth : x;
                    return (
                        <Text
                            key={field.id}
                            style={{
                                position: 'absolute',
                                left: Math.max(10, leftPos),
                                top: y - field.fontSize / 2,
                                width: textWidth,
                                fontSize: field.fontSize,
                                fontFamily: isBold ? 'Noto Sans Thai Bold' : 'Noto Sans Thai',
                                color: field.color,
                                textAlign: field.align as any,
                            }}
                        >
                            {getFieldValue(field.id, data)}
                        </Text>
                    );
                })}

                {/* Fallback layout when no background */}
                {!hasBg && (
                    <View style={s.content}>
                        <Text style={s.header}>เกียรติบัตร</Text>
                        <Text style={s.subheader}>OVEC Activity & Training Platform</Text>
                        <Text style={s.recipientLabel}>ขอมอบเกียรติบัตรฉบับนี้แก่</Text>
                        <Text style={s.recipientName}>{data.recipientName}</Text>
                        <Text style={s.courseTitle}>{data.courseTitle}</Text>
                        <Text style={s.dateText}>
                            ให้ไว้ ณ วันที่ {format(new Date(data.completionDate), 'd MMMM yyyy')}
                        </Text>
                        <View style={s.sigRow}>
                            <View style={s.sigBlock}>
                                <View style={s.sigLine} />
                                <Text style={s.sigName}>{template?.signerName || data.issuerName || 'ผู้อำนวยการ'}</Text>
                                <Text style={s.sigRole}>{template?.signerPosition || 'ผู้ให้การรับรองวิทยฐานะ'}</Text>
                            </View>
                            <View style={s.sigBlock}>
                                <View style={s.sigLine} />
                                <Text style={s.sigName}>{template?.orgName || 'สำนักงานคณะกรรมการการอาชีวศึกษา'}</Text>
                                <Text style={s.sigRole}>หน่วยงานส่งเสริมการพัฒนาบุคลากร</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Footer metadata */}
                <Text style={s.code}>เลขที่อ้างอิง: {data.certificateCode}</Text>
                <Text style={s.footer}>
                    ตรวจสอบได้ที่: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/verify/{data.certificateCode}
                </Text>

            </Page>
        </Document>
    );
};
