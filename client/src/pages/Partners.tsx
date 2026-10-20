import { PageHeader } from "@/components/PageHeader";
import { Building2, Globe2, Landmark } from "lucide-react";

export default function Partners() {
  const partnerLogos = [
    { name: "Partner 1", image: "/image1.png" },
    { name: "Partner 2", image: "/image2.png" },
    { name: "Partner 3", image: "/image3.png" },
    { name: "Partner 4", image: "/image4.png" },
    { name: "Partner 5", image: "/image5.png" },
    { name: "Partner 6", image: "/image6.png" },
    { name: "Partner 7", image: "/image7.png" },
    { name: "Partner 8", image: "/image8.png" },
    { name: "Partner 9", image: "/image9.png" },
    { name: "Partner 10", image: "/image10.png" },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Our Partners"
        description="We believe in the power of collaboration to achieve sustainable development goals."
      />

      <div className="container mx-auto px-4 py-20">
        {/* Partnership Logos Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-serif font-bold text-primary mb-4 text-center">
            Our Partner Organizations
          </h3>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Working alongside leading organizations to create positive social
            impact
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full mx-auto mb-12">
            {partnerLogos.map((partner, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer aspect-square sm:aspect-square flex items-center justify-center"
              >
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-4/5 h-4/5 object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Our valued partner organizations</p>
          </div>
        </div>

        {/* Call to Partner */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            Interested in Partnering with Us?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We are always open to new collaborations that advance our mission of
            social welfare.
          </p>
          <a
            href="mailto:isowcode@gmail.com"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Partnership Team
          </a>
        </div>
      </div>
    </div>
  );
}
