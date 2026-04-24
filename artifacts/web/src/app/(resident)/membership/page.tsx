import { AppSubHeader } from "@/components/layout/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Phone, Users, Star, Dumbbell } from "lucide-react";

export const dynamic = "force-dynamic";

const membershipTiers = [
  {
    name: "Individual",
    price: "150,000 MMK",
    period: "per year",
    description: "Perfect for single adults",
    features: [
      "Access to all SCSC facilities",
      "Member-rate facility bookings",
      "Priority booking windows",
      "10% discount on partner services",
    ],
    highlight: false,
  },
  {
    name: "Family",
    price: "350,000 MMK",
    period: "per year",
    description: "Up to 4 members under same unit",
    features: [
      "All Individual benefits",
      "Up to 4 family members",
      "Shared booking quota",
      "Family event access",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "500,000 MMK",
    period: "per year",
    description: "VIP experience with exclusive perks",
    features: [
      "All Family benefits",
      "48-hour advance booking",
      "5 guest passes per month",
      "VIP lounge access",
      "Dedicated support line",
    ],
    highlight: false,
  },
];

const benefits = [
  { icon: Dumbbell, title: "Full Facility Access", desc: "Pool, gym, tennis, and more" },
  { icon: Star, title: "Member Rates", desc: "Discounted facility bookings" },
  { icon: Users, title: "Community Events", desc: "Exclusive member gatherings" },
];

export default function MembershipPage() {
  return (
    <>
      <AppSubHeader title="SCSC Membership" backHref="/profile" backLabel="Profile" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-6">
        <section aria-labelledby="membership-intro" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-gold text-accent-foreground shadow-lg shadow-accent/20">
              <Crown className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="membership-intro" className="text-lg font-extrabold tracking-tight">
                Star City Sports Club
              </h2>
              <p className="text-sm text-muted-foreground">
                Unlock premium benefits and member rates
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="benefits-heading" className="space-y-3">
          <h3 id="benefits-heading" className="text-base font-bold tracking-tight">
            Member Benefits
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-card border border-card-border p-3 text-center"
              >
                <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-foreground">{title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="plans-heading" className="space-y-3">
          <h3 id="plans-heading" className="text-base font-bold tracking-tight">
            Membership Plans
          </h3>
          <div className="space-y-3">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`rounded-2xl overflow-hidden ${
                  tier.highlight
                    ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-card-border"
                }`}
              >
                <CardContent className="p-5">
                  {tier.highlight && (
                    <span className="inline-block px-2.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-extrabold tracking-tight">{tier.name}</h4>
                      <p className="text-xs text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-primary tabular-nums">
                        {tier.price}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{tier.period}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check
                          className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="text-foreground font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="rounded-2xl bg-muted/50 border border-border p-5 text-center space-y-3"
        >
          <h3 id="contact-heading" className="text-base font-bold tracking-tight">
            Ready to Join?
          </h3>
          <p className="text-sm text-muted-foreground">
            Visit the management office or contact us to purchase your membership.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>09-XXX-XXXX</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Online purchase coming soon
          </p>
        </section>
      </div>
    </>
  );
}
