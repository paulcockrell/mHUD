import {Injectable} from 'angular2/core'

declare var Buffer: any;

@Injectable()
export class CommandService {
  constructor(public command: string) {}

  encode() {
    return new Buffer(this.command + "\r");
  }
}
