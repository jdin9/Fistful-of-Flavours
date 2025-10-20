"use client";

import { FormProvider, useForm } from "react-hook-form";

import { PhoneListField } from "@/components/form/PhoneListField";
import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";

type ExampleForm = {
  contact: {
    bookerName: string;
    partyPhoneNumbers: string[];
  };
};

export function ButtonShowcase() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button size="sm">Primary sm</Button>
      <Button>Primary md</Button>
      <Button size="lg">Primary lg</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}

export function CardShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Optional description can span multiple lines to provide context.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body text-text/80">Use CardContent for the primary body copy or nested components.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Primary action</Button>
      </CardFooter>
    </Card>
  );
}

export function SectionShowcase() {
  return (
    <Section
      eyebrow="Eyebrow label"
      title="Section title"
      description="A quick description that explains the purpose of this section."
      actions={<Button variant="secondary">Action</Button>}
    >
      <div className="rounded-2xl border border-white/10 bg-card p-6">Content lives here.</div>
    </Section>
  );
}

export function FormFieldShowcase() {
  const {
    register,
    formState: { errors }
  } = useForm<{ name: string }>({
    defaultValues: { name: "" }
  });

  return (
    <FormField htmlFor="name" label="Full name" error={errors.name?.message || "Please add your name."}>
      {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} placeholder="Jordan" {...register("name")} />}
    </FormField>
  );
}

export function PhoneListFieldShowcase() {
  const form = useForm<ExampleForm>({
    defaultValues: { contact: { bookerName: "", partyPhoneNumbers: ["416-555-0123"] } }
  });

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(console.log)}>
        <FormField htmlFor="showcase-name" label="Name">
          {({ id, describedBy }) => (
            <Input id={id} aria-describedby={describedBy} {...form.register("contact.bookerName")} />
          )}
        </FormField>
        <PhoneListField />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
