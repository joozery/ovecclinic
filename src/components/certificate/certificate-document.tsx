
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

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 0,
        fontFamily: 'Noto Sans Thai',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fffdf9', // Ivory background
    },
    borderOuter: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        border: '2px solid #b8860b', // Dark gold
    },
    borderInner: {
        position: 'absolute',
        top: 30,
        left: 30,
        right: 30,
        bottom: 30,
        border: '1px solid #b8860b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    header: {
        fontSize: 32,
        fontFamily: 'Noto Sans Thai Bold',
        marginBottom: 10,
        color: '#1a237e',
        textAlign: 'center',
    },
    subheader: {
        fontSize: 16,
        marginBottom: 30,
        color: '#555',
        textAlign: 'center',
    },
    recipientLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 10,
    },
    recipientName: {
        fontSize: 36,
        fontFamily: 'Noto Sans Thai Bold',
        marginBottom: 10,
        color: '#000',
        textAlign: 'center',
        borderBottom: '1.5px solid #b8860b',
        minWidth: 400,
        paddingBottom: 5,
    },
    description: {
        fontSize: 14,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
        color: '#555',
        lineHeight: 1.5,
    },
    courseTitle: {
        fontSize: 22,
        fontFamily: 'Noto Sans Thai Bold',
        marginTop: 5,
        marginBottom: 20,
        color: '#1a237e',
        textAlign: 'center',
    },
    dateAndCodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 40,
        paddingHorizontal: 40,
    },
    signatureBlock: {
        alignItems: 'center',
        width: 250,
    },
    signatureLine: {
        width: '100%',
        borderBottom: '1px solid #333',
        marginBottom: 8,
    },
    signatureTitle: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Noto Sans Thai Bold',
    },
    signatureRole: {
        fontSize: 10,
        color: '#777',
    },
    sealContainer: {
        position: 'absolute',
        bottom: 100,
        right: 120,
        width: 100,
        height: 100,
        opacity: 0.8,
    },
    code: {
        position: 'absolute',
        bottom: 45,
        right: 45,
        fontSize: 9,
        color: '#b8860b',
        fontFamily: 'Noto Sans Thai Bold',
    },
    footerLink: {
        position: 'absolute',
        bottom: 45,
        left: 45,
        fontSize: 8,
        color: '#aaa',
    }
});

interface CertificateData {
    recipientName: string;
    courseTitle: string;
    completionDate: Date;
    certificateCode: string;
    issuerName?: string;
}

// Create Document Component
export const CertificateDocument = ({ data }: { data: CertificateData }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.background} />
            <View style={styles.borderOuter} />
            <View style={styles.borderInner}>
                <Text style={styles.header}>เกียรติบัตรแสดงความสำเร็จ</Text>
                <Text style={styles.subheader}>OVEC Activity & Training Platform</Text>

                <Text style={styles.recipientLabel}>ขอมอบเกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</Text>
                <Text style={styles.recipientName}>{data.recipientName}</Text>

                <Text style={styles.description}>
                    ได้ผ่านการเข้าร่วมและการทดสอบตามเกณฑ์วัดผล ประจำหลักสูตรการพัฒนาบุคลากร
                </Text>
                <Text style={styles.courseTitle}>"{data.courseTitle}"</Text>

                <Text style={styles.description}>
                    ให้ไว้ ณ วันที่ {format(new Date(data.completionDate), 'd MMMM yyyy')}
                </Text>

                <View style={styles.dateAndCodeRow}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>{data.issuerName || "ผู้อำนวยการเทคนิค"}</Text>
                        <Text style={styles.signatureRole}>ผู้ให้การรับรองวิทยฐานะ</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>สำนักงานคณะกรรมการการอาชีวศึกษา</Text>
                        <Text style={styles.signatureRole}>หน่วยงานส่งเสริมการพัฒนาบุคลากร</Text>
                    </View>
                </View>

                <Text style={styles.code}>เลขที่อ้างอิง: {data.certificateCode}</Text>
                <Text style={styles.footerLink}>ตรวจสอบความถูกต้องได้ที่: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/verify/{data.certificateCode}</Text>
            </View>
        </Page>
    </Document>
);
