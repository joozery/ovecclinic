
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportSystemData } from "@/actions/stats";
import { toast } from "sonner";

export function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csvContent = await exportSystemData();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `ovec_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" /> Export Report (CSV)
                </>
            )}
        </Button>
    );
}
