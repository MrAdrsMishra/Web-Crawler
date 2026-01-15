import { Injectable } from '@nestjs/common';
import { promises } from 'dns';

@Injectable()
export class DatabaseService {
    async createConnection(){
        const connectInstance = this.createConnection()
    }
}
