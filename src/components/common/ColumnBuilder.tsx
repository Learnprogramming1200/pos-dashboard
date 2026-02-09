"use client";
import React from "react";
import { WebComponents } from "..";

export function createColumns<T>(cfg: {
  fields: Array<{ name: string; selector: (row: T) => any; sortable?: boolean; width?: string; cell?: (row: T, index: number) => React.ReactNode }>;
  status?: {
    name?: string;
    idSelector: (row: T) => string | number;
    valueSelector: (row: T) => boolean;
    onToggle: (id: any, next: boolean) => void | Promise<void>;
  };
  actions?: Array<{
    render: (row: T) => React.ReactNode;
  }>;
}) {
  const cols: any[] = cfg.fields.map((f) => ({
    name: f.name,
    selector: f.selector,
    sortable: f.sortable ?? true,
    width: f.width,
    ...(f.cell && { cell: f.cell }),
  }));
  if (cfg.status) {
    cols.push({
      name: cfg.status.name ?? "Status",
      selector: (row: T) => (cfg.status!.valueSelector(row) ? "Active" : "Inactive"),
      cell: (row: T) => (
        <div className="flex items-center gap-2">
          <WebComponents.UiComponents.UiWebComponents.Switch
            checked={cfg.status!.valueSelector(row)}
            onCheckedChange={(checked) => cfg.status!.onToggle(cfg.status!.idSelector(row), checked)}
          />
        </div>
      ),
    });
  }
  if (cfg.actions?.length) {
    cols.push({
      name: "Actions",
      cell: (row: T) => (
        <div className="flex gap-2">
          {cfg.actions!.map((a, i) => (
            <React.Fragment key={i}>{a.render(row)}</React.Fragment>
          ))}
        </div>
      ),
      width: "120px",
      style: {
        paddingRight: '8px',
      }
    });
  }
  return cols;
}
