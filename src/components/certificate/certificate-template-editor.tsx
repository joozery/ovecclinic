
"use client";

import { useState, useRef, useCallback } from "react";
import { Award, Upload, Save, Loader2, Move, RotateCcw, Eye, Type, Check } from "lucide-react";
import { saveCertificateTemplate } from "@/actions/certificate-template";
import { toast } from "sonner";

interface TextField {
    id: string;
    label: string;
    x: number; // % from left
    y: number; // % from top
    fontSize: number;
    fontWeight: string;
    color: string;
    align: string;
}

interface Template {
    _id?: string;
    name: string;
    backgroundImageUrl?: string;
    fields: TextField[];
    signerName?: string;
    signerPosition?: string;
    orgName?: string;
}

const FIELD_SAMPLES: Record<string, string> = {
    recipientName: "นาย ทดสอบ ระบบเกียรติบัตร",
    courseTitle: "กิจกรรมการนิเทศการศึกษา ประจำปี 2569",
    completionDate: "25 กุมภาพันธ์ 2569",
    certificateCode: "OVEC-2569-0001",
};

export function CertificateTemplateEditor({ initialTemplate }: { initialTemplate: Template }) {
    const [template, setTemplate] = useState<Template>(initialTemplate);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<"design" | "fields" | "text">("design");
    const previewRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ dx: 0, dy: 0 });

    const handleBackgroundUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Upload failed");
            setTemplate(prev => ({ ...prev, backgroundImageUrl: json.url }));
            toast.success("อัปโหลดภาพพื้นหลังเรียบร้อยแล้ว");
        } catch (err: any) {
            toast.error(err.message || "อัปโหลดล้มเหลว");
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
        e.preventDefault();
        setSelectedField(fieldId);
        setDragging(fieldId);
        const rect = previewRef.current?.getBoundingClientRect();
        if (!rect) return;
        const field = template.fields.find(f => f.id === fieldId);
        if (!field) return;
        const fieldX = (field.x / 100) * rect.width;
        const fieldY = (field.y / 100) * rect.height;
        dragOffset.current = {
            dx: e.clientX - rect.left - fieldX,
            dy: e.clientY - rect.top - fieldY,
        };
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        const rect = previewRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.min(100, Math.max(0, ((e.clientX - rect.left - dragOffset.current.dx) / rect.width) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - rect.top - dragOffset.current.dy) / rect.height) * 100));
        setTemplate(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === dragging ? { ...f, x, y } : f),
        }));
    }, [dragging]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    const updateField = (id: string, updates: Partial<TextField>) => {
        setTemplate(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveCertificateTemplate({
                name: template.name,
                backgroundImageUrl: template.backgroundImageUrl,
                fields: template.fields,
                signerName: template.signerName,
                signerPosition: template.signerPosition,
                orgName: template.orgName,
            });
            toast.success("บันทึกแม่แบบเกียรติบัตรเรียบร้อยแล้ว");
        } catch {
            toast.error("ไม่สามารถบันทึกได้");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedFieldData = template.fields.find(f => f.id === selectedField);

    return (
        <div className="grid gap-6 xl:grid-cols-5">
            {/* Left Panel */}
            <div className="xl:col-span-2 space-y-4">
                {/* Tab Nav */}
                <div className="flex bg-slate-100/60 rounded-xl p-1 gap-1">
                    {([
                        { id: "design", label: "พื้นหลัง", icon: Upload },
                        { id: "fields", label: "ตำแหน่งข้อความ", icon: Move },
                        { id: "text", label: "รูปแบบตัวอักษร", icon: Type },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${activeTab === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Design Tab */}
                {activeTab === "design" && (
                    <div className="space-y-4">
                        {/* Background Upload */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-600" />
                                ภาพพื้นหลังเกียรติบัตร
                            </h3>
                            <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/30 ${isUploading ? "opacity-60 pointer-events-none" : ""} ${template.backgroundImageUrl ? "border-green-300 bg-green-50/20" : "border-slate-200"}`}>
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                ) : template.backgroundImageUrl ? (
                                    <>
                                        <Check className="w-8 h-8 text-green-500" />
                                        <span className="text-xs font-bold text-green-600">อัปโหลดสำเร็จ · คลิกเพื่อเปลี่ยน</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700">คลิกเพื่อเลือกภาพพื้นหลัง</p>
                                            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG · แนะนำขนาด A4 Landscape (1123×794px)</p>
                                        </div>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                            </label>
                            {template.backgroundImageUrl && (
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500 truncate">
                                        {template.backgroundImageUrl.split("/").pop()}
                                    </div>
                                    <button
                                        onClick={() => setTemplate(prev => ({ ...prev, backgroundImageUrl: undefined }))}
                                        className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-[11px] font-black hover:bg-red-100 transition-colors"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Signer Info */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                ข้อมูลผู้ลงนาม
                            </h3>
                            {[
                                { key: "signerName", label: "ชื่อผู้ลงนาม" },
                                { key: "signerPosition", label: "ตำแหน่ง" },
                                { key: "orgName", label: "ชื่อองค์กร" },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium transition-all"
                                        value={(template as any)[key] || ""}
                                        onChange={e => setTemplate(prev => ({ ...prev, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fields Tab - list of draggable fields */}
                {activeTab === "fields" && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Move className="w-4 h-4 text-blue-600" />
                            ฟิลด์ข้อความ
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400">คลิกและลาก 🖱️ บน Preview เพื่อจัดตำแหน่ง หรือปรับค่า X/Y ด้านล่าง</p>
                        <div className="space-y-2">
                            {template.fields.map(field => (
                                <button
                                    key={field.id}
                                    onClick={() => { setSelectedField(field.id); setActiveTab("text"); }}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${selectedField === field.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                                >
                                    <div>
                                        <p className="text-xs font-black text-slate-800">{field.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                            {FIELD_SAMPLES[field.id]?.substring(0, 28)}...
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 text-right">
                                        <div>X: {field.x.toFixed(0)}%</div>
                                        <div>Y: {field.y.toFixed(0)}%</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Text Style Tab */}
                {activeTab === "text" && selectedFieldData && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-800">{selectedFieldData.label}</h3>

                        {/* X/Y position */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: "x", label: "ตำแหน่ง X (%)" },
                                { key: "y", label: "ตำแหน่ง Y (%)" },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
                                    <input
                                        type="number" min="0" max="100"
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold"
                                        value={Math.round((selectedFieldData as any)[key])}
                                        onChange={e => updateField(selectedField!, { [key]: Number(e.target.value) })}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Font size */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ขนาดตัวอักษร (px)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range" min="8" max="64"
                                    className="flex-1 accent-blue-600"
                                    value={selectedFieldData.fontSize}
                                    onChange={e => updateField(selectedField!, { fontSize: Number(e.target.value) })}
                                />
                                <span className="text-sm font-black text-slate-700 w-8">{selectedFieldData.fontSize}</span>
                            </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">สีตัวอักษร</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                                    value={selectedFieldData.color}
                                    onChange={e => updateField(selectedField!, { color: e.target.value })}
                                />
                                <span className="text-sm font-mono font-bold text-slate-600">{selectedFieldData.color}</span>
                            </div>
                        </div>

                        {/* Font Weight */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">น้ำหนักตัวอักษร</label>
                            <div className="flex gap-2">
                                {["normal", "bold"].map(w => (
                                    <button
                                        key={w}
                                        onClick={() => updateField(selectedField!, { fontWeight: w })}
                                        className={`flex-1 py-2 rounded-xl border text-xs font-black transition-all ${selectedFieldData.fontWeight === w ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}
                                    >
                                        {w === "bold" ? "ตัวหนา" : "ปกติ"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Align */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">การจัดวาง</label>
                            <div className="flex gap-2">
                                {["left", "center", "right"].map(a => (
                                    <button
                                        key={a}
                                        onClick={() => updateField(selectedField!, { align: a })}
                                        className={`flex-1 py-2 rounded-xl border text-xs font-black transition-all ${selectedFieldData.align === a ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}
                                    >
                                        {a === "left" ? "ซ้าย" : a === "center" ? "กลาง" : "ขวา"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "text" && !selectedFieldData && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                        <Type className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">คลิกที่ข้อความบน Preview<br />หรือเลือกจากแท็บ "ตำแหน่งข้อความ"</p>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "กำลังบันทึก..." : "บันทึกแม่แบบ"}
                </button>
            </div>

            {/* Preview Panel */}
            <div className="xl:col-span-3 space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-black text-slate-700">Preview ตัวอย่างเกียรติบัตร</span>
                    <span className="ml-auto text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        🖱️ ลากข้อความเพื่อจัดตำแหน่ง
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-slate-50">
                    <div
                        ref={previewRef}
                        className="relative w-full select-none"
                        style={{ aspectRatio: "1123/794", cursor: dragging ? "grabbing" : "default" }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Background */}
                        {template.backgroundImageUrl ? (
                            <img
                                src={template.backgroundImageUrl}
                                alt="bg"
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#fffdf9] to-[#f5f0e8] flex items-center justify-center">
                                <div className="text-center opacity-30">
                                    <Award className="w-20 h-20 text-yellow-700 mx-auto mb-4" />
                                    <p className="text-lg font-black text-yellow-900">ยังไม่มีภาพพื้นหลัง</p>
                                    <p className="text-sm text-yellow-800">อัปโหลดจากแผงด้านซ้าย</p>
                                </div>
                            </div>
                        )}

                        {/* Border decoration (only if no bg) */}
                        {!template.backgroundImageUrl && (
                            <>
                                <div className="absolute inset-[2%] border-2 border-yellow-700/30 pointer-events-none rounded" />
                                <div className="absolute inset-[2.8%] border border-yellow-700/20 pointer-events-none rounded" />
                            </>
                        )}

                        {/* Draggable Fields */}
                        {template.fields.map(field => (
                            <div
                                key={field.id}
                                className={`absolute cursor-grab active:cursor-grabbing group transition-all`}
                                style={{
                                    left: `${field.x}%`,
                                    top: `${field.y}%`,
                                    transform: `translate(${field.align === "center" ? "-50%" : field.align === "right" ? "-100%" : "0"}, -50%)`,
                                    zIndex: selectedField === field.id ? 20 : 10,
                                }}
                                onMouseDown={e => handleMouseDown(e, field.id)}
                                onClick={() => { setSelectedField(field.id); setActiveTab("text"); }}
                            >
                                {/* Selection ring */}
                                <div className={`absolute -inset-1.5 rounded-lg border-2 border-dashed pointer-events-none transition-opacity ${selectedField === field.id ? "opacity-100 border-blue-500 bg-blue-500/5" : "opacity-0 group-hover:opacity-60 border-slate-400"}`} />

                                <p
                                    style={{
                                        fontSize: `${field.fontSize * 0.075}vw`,
                                        fontWeight: field.fontWeight,
                                        color: field.color,
                                        textAlign: field.align as any,
                                        whiteSpace: "nowrap",
                                        lineHeight: 1.2,
                                        textShadow: template.backgroundImageUrl ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                                    }}
                                >
                                    {FIELD_SAMPLES[field.id] || field.label}
                                </p>

                                {/* Label tooltip */}
                                <div className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md pointer-events-none transition-opacity ${selectedField === field.id ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`}>
                                    {field.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview info */}
                <div className="flex gap-3 flex-wrap">
                    {template.fields.map(field => (
                        <div key={field.id} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: field.color }} />
                            {field.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
