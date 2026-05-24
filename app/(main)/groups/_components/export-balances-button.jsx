"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function ExportBalancesButton({ groupName, balances, settlements }) {
  const exportToCsv = () => {
    try {
      const csvData = [
        ["Member", "Total Paid", "Total Owed", "Net Balance"],
        ...balances.map((balance) => [
          balance.user.name || balance.user.email,
          balance.totalPaid?.toFixed(2) || "0.00",
          balance.totalOwed?.toFixed(2) || "0.00",
          balance.netBalance?.toFixed(2) || "0.00",
        ]),
        [], // Empty row
        ["Settlement Suggestions"],
        ["From", "To", "Amount"],
        ...settlements.map((settlement) => [
          settlement.from.name || settlement.from.email,
          settlement.to.name || settlement.to.email,
          settlement.amount.toFixed(2),
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvData.map((row) => row.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${groupName.replace(/[^a-z0-9]/gi, "_")}_balances.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Balances exported to CSV successfully!");
    } catch (error) {
      toast.error("Failed to export balances");
    }
  };

  const exportToJson = () => {
    try {
      const data = {
        groupName,
        exportDate: new Date().toISOString(),
        balances: balances.map((balance) => ({
          member: balance.user.name || balance.user.email,
          totalPaid: balance.totalPaid || 0,
          totalOwed: balance.totalOwed || 0,
          netBalance: balance.netBalance || 0,
        })),
        settlements: settlements.map((settlement) => ({
          from: settlement.from.name || settlement.from.email,
          to: settlement.to.name || settlement.to.email,
          amount: settlement.amount,
        })),
      };

      const jsonContent =
        "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data, null, 2));

      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute(
        "download",
        `${groupName.replace(/[^a-z0-9]/gi, "_")}_balances.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Balances exported to JSON successfully!");
    } catch (error) {
      toast.error("Failed to export balances");
    }
  };

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(147, 51, 234);
      doc.text("WELTH SPLITWISE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Group Settlement Statement: ${groupName}`, 14, 26);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 32);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("Member Balances Summary", 14, 42);

      const balanceHeaders = ["Member", "Total Paid", "Total Owed", "Net Balance"];
      const balanceRows = balances.map((b) => [
        b.user.name || b.user.email,
        `$${b.totalPaid.toFixed(2)}`,
        `$${b.totalOwed.toFixed(2)}`,
        b.netBalance >= 0 ? `+$${b.netBalance.toFixed(2)}` : `-$${Math.abs(b.netBalance).toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: 46,
        head: [balanceHeaders],
        body: balanceRows,
        theme: "striped",
        headStyles: { fillColor: [147, 51, 234] },
        styles: { fontSize: 8 },
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index === 3) {
            const val = data.cell.raw;
            if (val.startsWith("+")) {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            } else if (val.startsWith("-")) {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      const nextStartY = doc.lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("Suggested Settlements to Clear Debts", 14, nextStartY);

      if (settlements.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("Everyone is fully settled up! No transactions needed.", 14, nextStartY + 6);
      } else {
        const settlementHeaders = ["From (Debtor)", "To (Creditor)", "Amount to Pay"];
        const settlementRows = settlements.map((s) => [
          s.from.name || s.from.email,
          s.to.name || s.to.email,
          `$${s.amount.toFixed(2)}`,
        ]);

        doc.autoTable({
          startY: nextStartY + 4,
          head: [settlementHeaders],
          body: settlementRows,
          theme: "grid",
          headStyles: { fillColor: [249, 115, 22] },
          styles: { fontSize: 8 },
        });
      }

      doc.save(`${groupName.replace(/[^a-z0-9]/gi, "_")}_settlement_report.pdf`);
      toast.success("Group settlement report exported as PDF successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF statement");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCsv} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJson} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-amber-600" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPdf} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-purple-600" />
          Export as PDF Statement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
