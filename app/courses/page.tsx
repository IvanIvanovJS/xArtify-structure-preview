// app/courses/page.tsx
import CourseCard from "@/components/CourseCard";

// Функция за извличане на курсовете от API-то
async function getCourses() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`, {
        cache: "no-store", // Деактивираме кеширането, за да виждаме винаги актуални данни
    });
    if (!res.ok) {
        throw new Error("Failed to fetch courses");
    }
    return res.json();
}

export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Каталог с Курсове</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((course: any) => (
                        <CourseCard key={course.id} course={course} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">
                        Все още няма налични курсове.
                    </p>
                )}
            </div>
        </div>
    );
}