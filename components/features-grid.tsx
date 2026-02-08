import { Upload, Palette, Smartphone, Code, Zap, PieChart } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description:
      "Simply drag and drop your GLB files. Our platform handles optimization and format conversion automatically.",
  },
  {
    icon: Palette,
    title: "Multiple Materials",
    description:
      "View all the materials inside your model in 3D and AR with full material editing support.",
  },
  {
    icon: Smartphone,
    title: "AR Ready",
    description:
      "Built-in augmented reality support for mobile devices. View models in real space with WebXR.",
  },
  {
    icon: Code,
    title: "Export Components",
    description:
      "Generate clean iframes for your models for easy embedding in websites and apps.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized rendering pipeline for peak performance and efficiency across all devices.",
  },
  {
    icon: PieChart,
    title: "Analytics",
    description:
      "View detailed analytics on model interactions, including views, time spent, and engagement.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
            Everything you need for 3D visualization
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed">
            Powerful features designed to make 3D model integration seamless and
            professional.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-accent">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-base font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
