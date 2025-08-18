// components/CourseCard.tsx
import Link from "next/link";
import Image from "next/image";
import { bgnToEur } from "@/lib/currency";

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string; // Може да добавим изображение за всеки курс
}

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-48">
                <Image
                    src={course.imageUrl || "/course-placeholder.jpg"}
                    alt={course.title}
                    fill // replaces layout="fill"
                    style={{ objectFit: "cover" }}
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                <p className="mt-4 text-2xl font-bold text-gray-900">{course.price.toFixed(2)} лв.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{bgnToEur(course.price).toFixed(2)} €</p>
                <Link href={`/courses/${course.id}`}>
                    <button className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
                        Научи повече
                    </button>
                </Link>
            </div>
        </div>
    );
}