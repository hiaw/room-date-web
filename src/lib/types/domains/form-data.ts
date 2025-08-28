export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
  dateOfBirth: string;
  location: string;
  profileImages: string[];
}

export interface RoomFormData {
  title: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  images: string[];
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isFlexibleTiming: boolean;
  maxGuests: number | undefined;
  minAge: number | undefined;
  maxAge: number | undefined;
  preferredGender: string[];
  eventImages: string[];
}

export interface MessageFormData {
  content: string;
  messageType?: "text" | "image";
  imageUrl?: string;
}

export interface ApplicationFormData {
  message?: string;
}
