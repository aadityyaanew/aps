"use client";
/**
 * CollegesTable.jsx — Table listing all colleges/universities (admin view).
 * Fully mobile responsive with smooth touch horizontal scroll.
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BookOpen, Globe, MapPin } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CollegesTable({ colleges, isLoading, onEdit, onManageCourses, onDelete }) {
  if (isLoading) return <Card><LoadingSpinner /></Card>;
  if (!colleges?.length) {
    return (
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        <EmptyState
          title="No colleges yet"
          description="Add your first college/university to get started."
        />
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">College / University</TableHead>
              <TableHead className="font-semibold text-slate-700">Location</TableHead>
              <TableHead className="font-semibold text-slate-700">Website</TableHead>
              <TableHead className="font-semibold text-slate-700">Courses</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges.map((col) => (
              <TableRow key={col.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-900 text-xs">{col.name}</TableCell>
                <TableCell className="text-xs text-slate-600">
                  {col.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      {col.location}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {col.website ? (
                    <a
                      href={col.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe size={12} />
                      {col.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-slate-200 gap-1 text-xs"
                    onClick={() => onManageCourses?.(col)}
                  >
                    <BookOpen size={11} />
                    {col.course_count ?? 0} course{col.course_count !== 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onManageCourses?.(col)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Manage Courses"
                    >
                      <BookOpen size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(col)}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      title="Edit College"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete?.(col)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete College"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
