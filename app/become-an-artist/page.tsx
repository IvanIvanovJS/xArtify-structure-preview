// app/become-an-artist/page.tsx
import { redirect } from "next/navigation";

export default function BecomeAnArtistPage() {
    // Redirect to subscription plans page
    redirect('/become-an-artist/plans');
}
