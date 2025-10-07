import { Metadata } from "next";
import FAQClient from "@/components/faq/FAQClient";

export const metadata: Metadata = {
    title: "Често задавани въпроси | xArtify",
    description: "Намерете отговори на най-често задаваните въпроси за xArtify платформата - покупка на картини, доставка, курсове, галерия и повече.",
    openGraph: {
        title: "Често задавани въпроси | xArtify",
        description: "Намерете отговори на най-често задаваните въпроси за xArtify платформата.",
        images: ["/og-image.jpg"],
    },
};

export default function FAQPage(): React.JSX.Element {
    return (
        <div className="faq-page">
            <FAQClient />
        </div>
    );
}
