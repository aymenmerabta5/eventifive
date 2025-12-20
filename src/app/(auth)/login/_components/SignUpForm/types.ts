export interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
}
