// Upload Artwork Types and Interfaces

export interface FilterOptions {
    techniques: string[];
    subjects: string[];
    styles: string[];
    tags: string[];
}

export interface UploadedFile {
    file: File;
    preview: string;
    id: string;
}

export interface UploadProgress {
    current: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    imageUrl: string;
    publicId: string;
    bytes: number;
    format: string;
    width: number;
    height: number;
}

export interface PaintingFormData {
    title: string;
    description?: string;
    dimensions?: string;
    materials?: string;
    price: number;
    technique: string;
    subject: string;
    style: string;
    tags: string[];
    widthCm?: number;
    heightCm?: number;
}




export interface UploadArtworkPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

// API Response Types
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaintingWithArtist {
    id: string;
    title: string;
    description: string | null;
    dimensions: string | null;
    materials: string | null;
    images: string[];
    price: number;
    isSold: boolean;
    artistId: string;
    widthCm: number | null;
    heightCm: number | null;
    slug: string | null;
    technique: string | null;
    subject: string | null;
    tags: string[];
    style: string | null;
    createdAt: Date;
    updatedAt: Date;
    artist: {
        id: string;
        bio: string | null;
        user: {
            name: string | null;
            email: string | null;
        };
    };
}

// Form Validation Types
export interface FormErrors {
    [key: string]: string | undefined;
}

export interface FormState {
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    errors: FormErrors;
}

// Upload States
export type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface UploadStatus {
    state: UploadState;
    progress: number;
    message?: string;
    error?: string;
}


// Security Types
export interface SecurityConfig {
    maxFileSize: number;
    allowedTypes: string[];
    maxPixels: number;
    maxSide: number;
    rateLimit: {
        requests: number;
        window: number;
    };
}

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: unknown;
    timestamp: Date;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

// Component Props Types
export interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
}

export interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export interface ErrorMessageProps {
    error: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export interface SuccessMessageProps {
    message: string;
    onDismiss?: () => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Handler Types
export type FileChangeHandler = (files: File[]) => void;
export type SubmitHandler<T> = (data: T) => Promise<void>;
export type ErrorHandler = (error: Error) => void;
