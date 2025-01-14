export class Email {
    private readonly _value: string;
  
    constructor(value: string) {
      if (!this.validate(value)) {
        throw new Error("Invalid email format");
      }
      this._value = value;
    }
  
    get value(): string {
      return this._value;
    }
  
    private validate(email: string): boolean {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  }
  