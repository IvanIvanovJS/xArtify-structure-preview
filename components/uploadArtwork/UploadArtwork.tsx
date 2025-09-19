"use client";

import { useSession } from 'next-auth/react';
import { Palette, Upload } from 'lucide-react';

import UploadArtworkForm from './UploadArtworkForm';
import './styles/upload-artwork.css';

export default function UploadArtwork(): React.JSX.Element {
    const { data: session } = useSession();

    return (
        <div className="upload-artwork-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Palette size={32} />
                    </div>
                    <div className="header-text">
                        <h1 className="page-title">Качи картина</h1>
                        <p className="page-subtitle">
                            Сподели творбите си с света и присъедини се към нашата общност от художници
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                <div className="tips-section">
                    <h3>Съвети за качване</h3>
                    <ul className="tips-list">
                        <li>Използвайте висококачествени изображения</li>
                        <li>Добавете подробно описание на творбата</li>
                        <li>Изберете подходящи тагове за по-лесно намиране</li>
                        <li>Укажете точните размери на картината</li>
                    </ul>
                </div>
                <div className="upload-section">
                    <div className="section-header">
                        <Upload size={24} />
                        <h2>Нова картина</h2>
                    </div>

                    <UploadArtworkForm
                        artistId={session?.user?.id || ''}
                    />
                </div>
            </div>
        </div>
    );
}
