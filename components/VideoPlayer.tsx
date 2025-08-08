// components/VideoPlayer.tsx
interface VideoPlayerProps {
    videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
    return (
        <div className="w-full">
            <video
                className="w-full h-auto rounded-lg shadow-lg"
                controls
                src={videoUrl}
            >
                Вашият браузър не поддържа видео тага.
            </video>
        </div>
    );
}