export class GenericResponse<T> {
  message?: string = 'Success';
  data?: T = null;
  constructor(message?: string, data?: T) {
    this.message = message;
    this.data = data;
  }
}
