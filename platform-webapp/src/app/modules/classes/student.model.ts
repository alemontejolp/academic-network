export class Student {
  firstname: string;
  lastname: string;
  email: string;
  passwd: string;
  password2: string;
  description: string;
  user_type_id: number;
  major_id: number;
}

export class Career {
  id: number;
  name: string;
}

export class TextFormat {
  text: string;
  style: string;
}

export class ElementCard {
  icon: string;
  text: TextFormat[];
  internalLink: string;
  externalLink: string;
}
