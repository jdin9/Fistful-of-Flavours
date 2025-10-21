"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { BookingFormValues } from "@/lib/validation";

import { FormField } from "./FormField";

export const PhoneListField = () => {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<BookingFormValues>();

  const { fields, append, remove } = useFieldArray({ control, name: "contact.partyPhoneNumbers" });
  const phoneErrors = errors.contact?.partyPhoneNumbers;
  const rootError =
    phoneErrors && !Array.isArray(phoneErrors) && typeof phoneErrors?.message === "string"
      ? phoneErrors.message
      : undefined;
  const maxReached = fields.length >= 5;

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const fieldError = Array.isArray(phoneErrors) ? phoneErrors[index] : undefined;
        const errorMessage =
          typeof fieldError?.message === "string"
            ? fieldError.message
            : index === 0
              ? rootError
              : undefined;
        const inputId = `phone-${index}`;

        return (
          <div key={field.id} className="flex flex-col gap-2">
            <FormField
              htmlFor={inputId}
              label={index === 0 ? "Mobile number" : `Additional number ${index + 1}`}
              hint={index === 0 ? "We’ll coordinate day-of updates via your preferred channel." : undefined}
              error={errorMessage}
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder={index === 0 ? "416-555-0123" : "Optional backup number"}
                  {...register(`contact.partyPhoneNumbers.${index}` as const)}
                />
              )}
            </FormField>
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="self-start text-sm text-text/70"
                onClick={() => remove(index)}
                type="button"
              >
                Remove
              </Button>
            )}
          </div>
        );
      })}
      <Button
        variant="secondary"
        size="sm"
        type="button"
        className="self-start"
        onClick={() => append("")}
        disabled={maxReached}
      >
        Add additional number
      </Button>
      <p className="text-xs text-text/70">
        We recommend adding the phone number for every guest—these contacts receive departure reminders and next-location updates.
      </p>
      {maxReached && <p className="text-xs text-muted">You can add up to 5 contacts.</p>}
    </div>
  );
};
