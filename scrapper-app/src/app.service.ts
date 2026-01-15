import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  checkHealth(): string {
    return 'Hey! Thank\'s to visit here your System is robust and Running Successfully.';
  }
 async getData(): Promise<string> {
    return "res";
  }
}
