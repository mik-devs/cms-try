// Mirrors App\Models\Setting
export interface Setting {
    key: string;
    value: string | null;
    type: string;
    group: string;
}

// Mirrors App\Models\HeroSlide
export interface HeroSlide {
    id: number;
    kicker: string | null;
    title: string;
    title_emphasis: string | null;
    subtitle: string | null;
    image: string;
    image_url: string;
    cta_text: string | null;
    cta_link: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\OfficialVideo
export interface OfficialVideo {
    id: number;
    title: string;
    video_file: string;
    video_url: string;
    order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// Mirrors App\Models\Stat
export interface Stat {
    id: number;
    label: string;
    value: number;
    suffix: string | null;
    icon: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\Service
export interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
    link: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\Committee
export interface Committee {
    id: number;
    name: string;
}

// Mirrors App\Models\MessageType
export interface MessageType {
    id: number;
    name: string;
}

// Mirrors App\Models\NewsCategory
export interface NewsCategory {
    id: number;
    name: string;
}

// Mirrors App\Models\JobStatus
export interface JobStatus {
    id: number;
    name: string;
}

// Mirrors App\Models\News
export interface News {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    image: string | null;
    image_url: string | null;
    news_category_id: number | null;
    news_category?: NewsCategory | null;
    is_featured: boolean;
    status: 'draft' | 'published';
    published_at: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
}

// Mirrors App\Models\Achievement
export interface Achievement {
    id: number;
    title: string;
    description: string;
    image: string | null;
    image_url: string | null;
    badge_year: string;
    facebook_url: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\Barangay
export interface Barangay {
    id: number;
    name: string;
    slug: string;
    population: number | null;
    captain: string | null;
    contact: string | null;
    latitude: string | null;
    longitude: string | null;
    order: number;
}

// Mirrors App\Models\TourismSpotImage
export interface TourismSpotImage {
    id: number;
    tourism_spot_id: number;
    image_path: string;
    image_url: string;
    order: number;
}

// Mirrors App\Models\TourismSpot
export interface TourismSpot {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    image_url: string;
    category: string | null;
    barangay_id: number | null;
    barangay?: Barangay | null;
    latitude: string | null;
    longitude: string | null;
    order: number;
    is_active: boolean;
    images?: TourismSpotImage[];
}

// Mirrors App\Models\JobPosting
export interface JobPosting {
    id: number;
    title: string;
    description: string;
    department: string;
    deadline: string | null;
    job_status_id: number | null;
    status?: JobStatus | null;
    created_at: string;
    updated_at: string;
}

// Mirrors App\Models\EmergencyContact
export interface EmergencyContact {
    id: number;
    name: string;
    phone: string;
    icon: string;
    description: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\Bid
export interface Bid {
    id: number;
    title: string;
    pdf_path: string | null;
    pdf_url: string | null;
    date_posted: string;
    status: 'open' | 'closed';
}

// Mirrors App\Models\AnnualReport
export interface AnnualReport {
    id: number;
    title: string;
    category: string | null;
    pdf_path: string;
    pdf_url: string | null;
    year: number;
    date_posted: string;
}

// Mirrors App\Models\CitizenCharter
export interface CitizenCharter {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    file_url: string | null;
    order: number;
}

// Mirrors App\Models\Office
export interface Office {
    id: number;
    name: string;
    head: string | null;
    contact_number: string | null;
    email: string | null;
    location: string | null;
    order: number;
    is_active: boolean;
}

// Mirrors App\Models\Official
export interface Official {
    id: number;
    name: string;
    position: string;
    committees?: Committee[];
    photo: string | null;
    photo_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    order: number;
}

// Mirrors App\Models\MayorMessage
export interface MayorMessage {
    id: number;
    title: string;
    content: string;
    image: string | null;
    image_url: string | null;
    message_type_id: number | null;
    message_type?: MessageType | null;
    published_at: string | null;
}

// Mirrors App\Models\Page
export interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// Mirrors App\Http\Controllers\Public\HomeController::index() props
export interface HomePageProps {
    settings: Record<string, string>;
    heroSlides: HeroSlide[];
    stats: Stat[];
    services: Service[];
    latestNews: News[];
    achievements: Achievement[];
    barangays: Barangay[];
    tourismSpots: TourismSpot[];
    latestJobs: JobPosting[];
    emergencyContacts: EmergencyContact[];
    bids: Bid[];
    annualReports: AnnualReport[];
    mayorMessage: MayorMessage | null;
}
