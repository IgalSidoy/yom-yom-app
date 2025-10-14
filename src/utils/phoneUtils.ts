/**
 * Utility functions for phone number formatting
 */

/**
 * Formats a phone number to XXX-XXX-XXXX format for Israeli numbers (10 digits)
 * @param phone - The phone number string to format
 * @returns Formatted phone number or original string if not 10 digits
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format as XXX-XXX-XXXX for Israeli numbers (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if not 10 digits
  return phone;
};
