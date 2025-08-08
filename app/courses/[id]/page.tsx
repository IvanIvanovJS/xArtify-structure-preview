// app/courses/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VideoPlayer from "@/components/VideoPlayer";
import { prisma } from "@/lib/prisma";

interface Props {
    params: { id: string };
}

export default async function CourseDetailPage({ params }: Props) {
    const session = await getServerSession(authOptions);

    const course = await prisma.course.findUnique({
        where: { id: params.id },
    });

    if (!course) {
        notFound(); // Показва 404 страница, ако курсът не е намерен
    }

    // Проверка дали потребителят е абониран за този курс
    const isEnrolled = session
        ? await prisma.enrollment.findFirst({
            where: {
                userId: session.user.id,
                courseId: params.id,
            },
        })
        : false;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-700 mb-6">{course.description}</p>

            {/* Условно рендиране на съдържанието */}
            {isEnrolled ? (
                <div className="space-y-8">
                    <h2 className="text-3xl font-semibold mt-8">Видеоклипове на курса</h2>
                    {course.videoUrls.map((videoUrl, index) => (
                        <div key={index}>
                            <h3 className="text-2xl font-medium mb-2">Видео {index + 1}</h3>
                            <VideoPlayer videoUrl={videoUrl} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p className="font-bold">Абонаментът е задължителен</p>
                    <p>За да получите достъп до съдържанието на този курс, моля, абонирайте се.</p>
                    <button className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                        Абонирай се
                    </button>
                </div>
            )}

            {/* Секция за материали */}
            <div className="mt-12">
                <h2 className="text-3xl font-semibold">Необходими материали</h2>
                {/* Тук ще рендираме компонента за материали */}
                {/* Например: <MaterialsList courseId={course.id} /> */}
            </div>
        </div>
    );
}