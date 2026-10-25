"use client";
/**
 * CollegesTable.jsx — Table listing all colleges/universities (admin view).
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
      <Card>
        <EmptyState
          title="No colleges yet"
          description="Add your first college/university to get started."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>College / University</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges.map((col) => (
              <TableRow key={col.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{col.name}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {col.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      {col.location}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
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
                    className="cursor-pointer hover:bg-slate-200 gap-1"
                    onClick={() => onManageCourses?.(col)}
                  >
                    <BookOpen size={11} />
                    {col.course_count ?? 0} course{col.course_count !== 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell>
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
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
