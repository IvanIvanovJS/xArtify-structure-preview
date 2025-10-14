// app/artist/courses/page.tsx
import { type Metadata } from "next";
import { JSX } from "react";
import CourseManagement from "@/components/artist/CourseManagement/CourseManagement";

export const metadata: Metadata = {
    title: "Управление на Курсове - Артист Портал",
    description: "Създаване и управление на курсове",
};

export default function CoursesPage(): JSX.Element {
    return <CourseManagement />;
}
