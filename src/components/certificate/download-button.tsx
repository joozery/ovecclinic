
"use client";

import dynamic from "next/dynamic";
import { Loader2, Download } from "lucide-react";
import { CertificateDocument } from "./certificate-document";

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลด...
            </button>
        ),
    }
);

interface DownloadButtonProps {
    data: {
        recipientName: string;
        courseTitle: string;
        completionDate: Date;
        certificateCode: string;
        issuerName?: string;
    };
    template?: {
        backgroundImageUrl?: string;
        fields?: any[];
        signerName?: string;
        signerPosition?: string;
        orgName?: string;
    };
    fileName: string;
    label?: string;
}

export function DownloadButton({ data, template, fileName, label = "ดาวน์โหลดเกียรติบัตร (PDF)" }: DownloadButtonProps) {
    return (
        <PDFDownloadLink
            document={<CertificateDocument data={data} template={template} />}
            fileName={fileName}
            style={{ width: '100%' }}
        >
            {({ loading }) =>
                loading ? (
                    <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
                        <Loader2 className="w-4 h-4 animate-spin" /> กำลังสร้างไฟล์ PDF...
                    </button>
                ) : (
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 transition-all active:scale-95 group">
                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        {label}
                    </button>
                )
            }
        </PDFDownloadLink>
    );
}
